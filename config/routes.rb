# typed: true
# frozen_string_literal: true

# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  # == Redirects
  constraints subdomain: "www" do
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
  resources :images, only: :show, param: :signed_id, export: true

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
    member do
      post :delivered
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
  get "/world/join_requests" => "join_requests#index", export: true

  # == Friends
  resources :friends, only: %i[create update destroy], export: true do
    # member do
    #   post :pause
    # end
  end
  get "/world/friends" => "friends#index", export: true

  # == Friend notification settings
  resource :friend_notification_settings, only: %i[show update], export: true

  # == Users
  resources :users, only: [], export: true do
    # collection do
    #   get :joined
    # end
    member do
      post :request_invitation
    end
  end
  get "/@:handle" => "users#show", as: :user, export: true
  get "/@:handle/join" => "users#join"
  get "/@:handle/manifest.webmanifest" => "users#manifest",
      constraints: { format: "" },
      export: true

  # == Posts
  resources :posts, only: %i[index create update destroy], export: true do
    collection do
      get :pinned
    end
    member do
      get :stats
      post :mark_as_replied
    end
  end
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

  # == Encouragements
  resources :encouragements, only: %i[index create], export: true

  # == Universe
  resource :universe, only: :show, export: { namespace: "universe" } do
    get :worlds
  end

  # == Pages
  root "landing#show", export: true
  get "/src" => redirect(
    "https://github.com/hulloitskai/smallerworld",
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
