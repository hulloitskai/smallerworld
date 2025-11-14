# typed: true
# frozen_string_literal: true

# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  # == Redirects ==

  constraints SubdomainConstraint do
    get "(*any)" => redirect(subdomain: "", status: 302)
  end

  # == Errors ==

  scope controller: :errors do
    get "/401", action: :unauthorized
    get "/404", action: :not_found
    get "/422", action: :unprocessable_entity
    get "/500", action: :internal_server_error
  end

  # == Healthcheck ==

  defaults export: true do
    Healthcheck.routes(self)
  end

  # == Good Job ==

  mount GoodJob::Engine => "/good_job"

  # == Attachments ==

  resources :files, param: :signed_id, only: :show, export: true
  resources :images, param: :signed_id, only: :show, export: true do
    member do
      get :download
    end
  end

  # == Contact ==

  resource :contact_url, only: :show, export: true

  # == Push Subscriptions ==

  resources :push_subscriptions, only: :create, export: true do
    collection do
      get :public_key
      post :lookup
      post :change
      post :unsubscribe
      post :test
    end
  end

  # == Notifications ==

  resources :notifications, only: [], export: true do
    collection do
      post :mark_delivered
    end
  end

  # == Visits ==

  resources :visits, only: :create, export: true

  # == Login Requests ==

  resources :login_requests, only: :create, export: true

  # == Sessions ==

  scope controller: :sessions, export: true do
    get "/login", action: :new
    post "/login", action: :create
    post "/logout", action: :destroy
  end

  # == Registrations ==

  scope controller: :registrations, export: true do
    get "/signup", action: :new
    post "/signup", action: :create
  end

  # == Start ==

  get "/start" => "start#redirect", export: true

  # == World ==

  resource :world, only: %i[show edit update], export: { namespace: "world" } do
    get :timeline
    get "manifest.webmanifest" => :manifest, constraints: { format: "" }
  end
  resources(
    :world_posts,
    path: "/world/posts",
    only: %i[index create update destroy],
    export: true,
  ) do
    collection do
      get :pinned
    end
    member do
      get :audience
      get :stats
      get :viewers
      post :share
    end
  end
  resources(
    :world_friends,
    path: "/world/friends",
    only: %i[index create update destroy],
    export: true,
  ) do
    member do
      get :invitation
      post :pause
      post :unpause
    end
  end
  resources :world_join_requests,
            path: "/world/join_requests",
            only: %i[index destroy],
            export: true
  resources :world_invitations,
            path: "/world/invitations",
            only: %i[index create update destroy],
            export: true
  resources :world_activities,
            path: "/world/activities",
            only: %i[index create],
            export: true
  resources :world_encouragements,
            path: "/world/encouragements",
            only: :index,
            export: true

  # == Universe ==

  resource(
    :universe,
    path: "/world/universe",
    only: :show,
    export: { namespace: "universe" },
  ) do
    get :worlds
  end
  resources :universe_posts,
            path: "/world/universe/posts",
            only: :index,
            export: true

  # == Friend Notification Settings ==

  resource :friend_notification_settings,
           only: %i[show update],
           export: true

  # == Invitations ==

  resources :invitations, only: :show, export: true do
    member do
      post :accept
    end
  end

  # == Posts ==

  resources :posts, only: [], export: true do
    member do
      post :share
      post :mark_seen
      post :mark_replied
    end
  end

  # == Users ==

  resources :users, only: [], export: true do
    member do
      get :timeline
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
  resources(
    :user_activity_coupons,
    path: "/users/:user_id/activity_coupons",
    only: :index,
    export: true,
  )

  # == Post Reactions ==

  resources :post_reactions,
            path: "/posts/:post_id/reactions",
            only: %i[index create],
            export: true
  resources :post_reactions,
            only: :destroy,
            export: true

  # == Post Stickers ==

  resources :post_stickers,
            path: "/posts/:post_id/stickers",
            only: %i[index create],
            export: true
  resources :post_stickers,
            only: %i[update destroy],
            export: true

  # == Post Shares ==

  resources :post_shares, only: :show, export: true

  # == Encouragements ==

  resources :encouragements, only: :create, export: true

  # == Activities & Coupons ==

  resources :activity_coupons, only: :create, export: true do
    member do
      post :mark_as_redeemed
    end
  end

  # == Canny ==

  post "/canny/sso_token" => "canny#sso_token", export: true

  # == Policies ==

  get "/policies" => "policies#show", export: true

  # == Announcements ==

  resources :announcements,
            only: :index,
            export: true
  resources :announcements,
            only: :create,
            export: true

  # == Marsha Puzzle ==

  resources :marsha_puzzles, only: :show

  # == Memberships ==

  resource(
    :membership,
    only: [],
    export: true,
  ) do
    post :activate
  end

  # == Pages ==

  root "landing#show", export: true
  get "/src" => redirect(
    "https://github.com/hulloitskai/smallerworld",
    status: 302,
  )
  get "/sentry" => redirect(
    "https://smallerworld.sentry.io/issues/",
    status: 302,
  )
  get "/feedback" => "feedback#redirect", export: true
  get "/analytics" => redirect(
    "https://app.amplitude.com/analytics/smallerworld/home",
    status: 302,
  )
  get "/support" => "support#redirect", export: true
  get "/support/success" => "support#success"
  get "/shortlinks" => redirect(
    "https://app.dub.co/smallerworld/links",
    status: 302,
  )
  inertia "/update1" => "Update1Page"

  # == Devtools ==

  if Rails.env.development?
    scope export: { namespace: "test" } do
      get "/test" => "test#show"
      post "/test/submit" => "test#submit"
    end
    get "/mailcatcher" => redirect("//localhost:1080", status: 302)
  end
end
