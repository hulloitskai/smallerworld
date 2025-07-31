# typed: true
# frozen_string_literal: true

# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  # == Redirects
  constraints SubdomainConstraint do
    get "(*any)" => redirect(subdomain: "", status: 302)
  end

  # == Errors
  scope controller: :errors do
    match "/401", action: :unauthorized, via: :all
    match "/404", action: :not_found, via: :all
    match "/422", action: :unprocessable_entity, via: :all
    match "/500", action: :internal_server_error, via: :all
  end

  # == Healthcheck
  defaults export: true do
    Healthcheck.routes(self)
  end

  # == Good Job
  mount GoodJob::Engine => "/good_job"

  # == Attachments
  resources :files, only: :show, param: :signed_id, export: true
  resources :images, only: :show, param: :signed_id, export: true do
    member do
      get :download
    end
  end

  # == Contact
  resource :contact_url, only: :show, export: { namespace: "contact_url" }

  # == Push subscriptions
  resources :push_subscriptions, only: :create, export: true do
    collection do
      get :public_key
      post :lookup
      post :change
      post :unsubscribe
      post :test
    end
  end

  # == Notifications
  resources :notifications, only: [], export: true do
    collection do
      post :mark_delivered
    end
    member do
      post :delivered, export: false
    end
  end

  # == Visits
  post "/visit" => "visits#track", export: true

  # == Phone verification requests
  resources :phone_verification_requests, only: :create, export: true

  # == Sessions
  resource :session,
           only: %i[new create],
           path: "/login",
           path_names: { new: "" },
           export: { namespace: "session" }
  post "/logout" => "sessions#destroy", export: true

  # == Registrations
  resource :registration,
           only: %i[new create],
           path: "/signup",
           path_names: { new: "" },
           export: { namespace: "registration" }

  # == Start
  get "/start" => "start#redirect", export: { namespace: "start" }

  # == World
  resource :world, only: %i[show edit update], export: { namespace: "world" } do
    get "manifest.webmanifest" => :manifest, constraints: { format: "" }
  end
  get "/home" => redirect("/world")

  # == Join requests
  resources :join_requests, only: %i[destroy], export: true
  scope :world do
    resources :join_requests, only: :index, export: true
  end

  # == Friends
  resources :friends, only: %i[create update destroy], export: true do
    member do
      post :pause
      post :unpause
    end
  end
  scope :world do
    resources :friends, only: :index, export: true
  end

  # == Friend notification settings
  resource :friend_notification_settings, only: %i[show update], export: true

  # == Posts
  resources :posts, only: %i[index create update destroy], export: true do
    collection do
      get :pinned
    end
    member do
      get :stats
      post :share
      post :mark_seen
      post :mark_replied
    end
  end

  # == Users
  resources :users, only: [], export: true do
    member do
      post :request_invitation
      get "manifest.webmanifest" => :manifest, constraints: { format: "" }
    end
  end
  get "/@:id" => "users#show", as: :user, export: true
  get "/@:id/join" => "users#join"
  resources(
    :user_posts,
    path: "/users/:user_id/posts",
    only: :index,
    export: true,
  ) do
    collection do
      get :pinned
    end
  end

  # == Post reactions
  resources :post_reactions,
            path: "/posts/:post_id/reactions",
            only: %i[index create],
            export: true
  resources :post_reactions, only: :destroy, export: true

  # == Post stickers
  resources :post_stickers,
            path: "/posts/:post_id/stickers",
            only: %i[index create],
            export: true
  resources :post_stickers, only: %i[update destroy], export: true

  # == Post shares
  resources :post_shares, only: :show, export: true

  # == Encouragements
  resources :encouragements, only: %i[index create], export: true

  # == Activities
  resources :activities, only: %i[index create], export: true
  resources :activity_coupons, only: %i[index create], export: true do
    member do
      post :mark_as_redeemed
    end
  end

  # == Universe
  resource :universe, only: :show, export: { namespace: "universe" } do
    get :worlds
    get "manifest.webmanifest" => :manifest, constraints: { format: "" }
  end
  resources :universe_posts, path: "/universe/posts", only: :index, export: true

  # == Api
  resources :api_posts, path: "/api/posts", only: :create
  post "/api/post" => "api_posts#create"

  # == Policies
  get "/policies" => "policies#show", export: true

  # == Pages
  root "landing#show", export: true
  get "/src" => redirect(
    "https://github.com/hulloitskai/smallerworld",
    status: 302,
  )
  get "/sentry" => redirect(
    "https://smallerworld.sentry.io/issues/",
    status: 302,
  )
  get "/feedback" => redirect("https://smallerworld.canny.io", status: 302)
  get "/analytics" => redirect(
    "https://app.amplitude.com/analytics/smallerworld/home",
    status: 302,
  )

  # == Devtools
  if Rails.env.development?
    resource(
      :test,
      controller: "test",
      only: :show,
      export: { namespace: "test" },
    ) do
      post :submit
    end
    get "/mailcatcher" => redirect("//localhost:1080", status: 302)
  end
end
