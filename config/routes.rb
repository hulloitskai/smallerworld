# typed: true
# frozen_string_literal: true

# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  # == Redirects
  constraints SubdomainConstraint do
    get "(*any)" => redirect(subdomain: "", status: 302)
  end

  # == Errors
  scope controller: :errors, constraints: { format: %w[html json] } do
    get "/401", action: :unauthorized
    get "/404", action: :not_found
    get "/422", action: :unprocessable_entity
    get "/500", action: :internal_server_error
  end

  # == Healthcheck
  defaults constraints: { format: "json" }, export: true do
    Healthcheck.routes(self)
  end

  # == Good Job
  mount GoodJob::Engine => "/good_job"

  # == Attachments
  resources :files,
            only: :show,
            param: :signed_id,
            constraints: { format: "json" },
            export: true
  resources(
    :images,
    only: :show,
    param: :signed_id,
    constraints: { format: "json" },
    export: true,
  ) do
    member do
      get :download
    end
  end

  # == Contact
  resource :contact_url,
           only: :show,
           constraints: { format: "json" },
           export: { namespace: "contact_url" }

  # == Push subscriptions
  resources(
    :push_subscriptions,
    only: :create,
    constraints: { format: "json" },
    export: true,
  ) do
    collection do
      get :public_key
      post :lookup
      post :change
      post :unsubscribe
      post :test
    end
  end

  # == Notifications
  resources(
    :notifications,
    only: [],
    constraints: { format: "json" },
    export: true,
  ) do
    collection do
      post :mark_delivered
    end
    member do
      post :delivered, export: false
    end
  end

  # == Visits
  post "/visit" => "visits#track", constraints: { format: "json" }, export: true

  # == Login requests
  resources :login_requests,
            only: :create,
            constraints: { format: "json" },
            export: true

  # == Sessions
  scope export: { namespace: "session" } do
    get "/login" => "sessions#new", constraints: { format: "html" }
    scope constraints: { format: "json" } do
      post "/login" => "sessions#create"
      post "/logout" => "sessions#destroy"
    end
  end

  # == Registrations
  scope export: { namespace: "registration" } do
    get "/signup" => "registrations#new", constraints: { format: "html" }
    post "/signup" => "registrations#create", constraints: { format: "json" }
  end

  # == Start
  get "/start" => "start#redirect",
      constraints: { format: :html },
      export: { namespace: "start" }

  # == World
  scope export: { namespace: "world" } do
    resource :world, only: %i[show edit], constraints: { format: "html" }
    resource :world, only: :update, constraints: { format: "json" } do
      get "manifest.webmanifest" => :manifest, constraints: { format: "" }
    end
  end
  get "/world/posts" => "world_posts#index",
      constraints: { format: "html" },
      export: true
  resources(
    :world_posts,
    path: "/world/posts",
    only: %i[create update destroy],
    constraints: { format: "json" },
    export: true,
  ) do
    collection do
      get :pinned
    end
    member do
      get :stats
      get :viewers
      post :share
    end
  end
  get "/world/friends" => "world_friends#index",
      constraints: { format: "html" },
      export: true
  resources(
    :world_friends,
    path: "/world/friends",
    only: %i[create update destroy],
    constraints: { format: "json" },
    export: true,
  ) do
    collection do
      get :text_subscribers
    end
    member do
      get :invitation
      post :pause
      post :unpause
    end
  end
  get "/world/join_requests" => "world_join_requests#index",
      constraints: { format: %w[html json] },
      export: true
  resources :world_join_requests,
            path: "/world/join_requests",
            only: :destroy,
            constraints: { format: "json" },
            export: true
  get "/world/invitations" => "world_invitations#index",
      constraints: { format: %w[html json] },
      export: true
  resources :world_invitations,
            path: "/world/invitations",
            only: %i[create update destroy],
            constraints: { format: "json" },
            export: true
  resources :world_activities,
            path: "/world/activities",
            only: %i[index create],
            constraints: { format: "json" },
            export: true
  resources :world_encouragements,
            path: "/world/encouragements",
            only: :index,
            constraints: { format: "json" },
            export: true

  # == Friend notification settings
  resource :friend_notification_settings,
           only: %i[show update],
           constraints: { format: "json" },
           export: true

  # == Invitations
  resources :invitations,
            only: :show,
            constraints: { format: "html" },
            export: true
  resources(
    :invitations,
    only: [],
    constraints: { format: "json" },
    export: true,
  ) do
    member do
      post :accept
    end
  end

  # == Posts
  resources :posts, only: [], constraints: { format: "json" }, export: true do
    member do
      post :share
      post :mark_seen
      post :mark_replied
    end
  end

  # == Users
  resources :users, only: [], export: true do
    member do
      post :request_invitation, constraints: { format: "json" }
      get "manifest.webmanifest" => :manifest, constraints: { format: "" }
    end
  end
  get "/@:id" => "users#show",
      as: :user,
      constraints: { format: "html" },
      export: true
  get "/@:id/join" => "users#join", constraints: { format: "html" }
  resources(
    :user_posts,
    path: "/users/:user_id/posts",
    only: :index,
    constraints: { format: "json" },
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
    constraints: { format: "json" },
    export: true,
  )

  # == Post reactions
  resources :post_reactions,
            path: "/posts/:post_id/reactions",
            only: %i[index create],
            constraints: { format: "json" },
            export: true
  resources :post_reactions,
            only: :destroy,
            constraints: { format: "json" },
            export: true

  # == Post stickers
  resources :post_stickers,
            path: "/posts/:post_id/stickers",
            only: %i[index create],
            constraints: { format: "json" },
            export: true
  resources :post_stickers,
            only: %i[update destroy],
            constraints: { format: "json" },
            export: true

  # == Post shares
  resources :post_shares,
            only: :show,
            constraints: { format: "html" },
            export: true

  # == Encouragements
  resources :encouragements,
            only: :create,
            constraints: { format: "json" },
            export: true

  # == Activities & coupons
  resources(
    :activity_coupons,
    only: :create,
    constraints: { format: "json" },
    export: true,
  ) do
    member do
      post :mark_as_redeemed
    end
  end

  # == Universe
  scope export: { namespace: "universe" } do
    get "/universe" => "universe#show", constraints: { format: "html" }
    get "/universe/worlds" => "universe#worlds",
        constraints: { format: "json" }
    get "/universe/manifest.webmanifest" => "universe#manifest",
        constraints: { format: "" }
  end
  resources :universe_posts,
            path: "/universe/posts",
            only: :index,
            constraints: { format: "json" },
            export: true

  # == Api
  resources :api_posts,
            path: "/api/posts",
            only: :create,
            constraints: { format: "json" }

  # == Canny
  post "/canny/sso_token" => "canny#sso_token",
       constraints: { format: "json" },
       export: true

  # == Policies
  get "/policies" => "policies#show",
      constraints: { format: "html" },
      export: true

  # == Announcements
  resources :announcements,
            only: :index,
            constraints: { format: %w[html json] },
            export: true
  resources :announcements,
            only: :create,
            constraints: { format: "json" },
            export: true

  # == Pages
  root "landing#show", export: true
  scope constraints: { format: "html" } do
    get "/src" => redirect(
      "https://github.com/hulloitskai/smallerworld",
      status: 302,
    )
    get "/sentry" => redirect(
      "https://smallerworld.sentry.io/issues/",
      status: 302,
    )
    get "/feedback" =>  "feedback#redirect", export: true
    get "/analytics" => redirect(
      "https://app.amplitude.com/analytics/smallerworld/home",
      status: 302,
    )
    inertia "/update1" => "Update1Page"
  end

  # == Devtools
  if Rails.env.development?
    scope export: { namespace: "test" } do
      get "/test" => "test#show", constraints: { format: "html" }
      post "/test/submit" => "test#submit", constraints: { format: "json" }
    end
    get "/mailcatcher" => redirect("//localhost:1080", status: 302),
        constraints: { format: "html" }
  end
end
