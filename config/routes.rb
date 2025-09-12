# typed: true
# frozen_string_literal: true

# Define your application routes per the DSL in
# https://guides.rubyonrails.org/routing.html
Rails.application.routes.draw do
  # == Redirects
  constraints SubdomainConstraint do
    get "(*any)", to: redirect(subdomain: "", status: 302)
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
  mount GoodJob::Engine, at: "/good_job"

  # == Attachments
  resources :files,
            only: :show,
            param: :signed_id,
            constraints: { format: "json" },
            export: true
  resources :images,
            only: :show,
            param: :signed_id,
            constraints: { format: "json" },
            export: true
  get "/images/:signed_id/download", to: "images#download", export: true

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
  post "/visit",
       to: "visits#track",
       constraints: { format: "json" },
       export: true

  # == Login requests
  resources :login_requests,
            only: :create,
            constraints: { format: "json" },
            export: true

  # == Sessions
  scope controller: :sessions, export: { namespace: "session" } do
    get "/login", action: :new, constraints: { format: "html" }
    scope constraints: { format: "json" } do
      post "/login", action: :create
      post "/logout", action: :destroy
    end
  end

  # == Registrations
  scope controller: :registrations, export: { namespace: "registration" } do
    get "/signup", action: :new, constraints: { format: "html" }
    post "/signup", action: :create, constraints: { format: "json" }
  end

  # == Start
  get "/start",
      to: "start#redirect",
      constraints: { format: :html },
      export: { namespace: "start" }

  # == World
  scope export: { namespace: "world" } do
    resource :world, only: %i[show edit], constraints: { format: "html" }
    resource :world, only: :update, constraints: { format: "json" } do
      get "manifest.webmanifest", action: :manifest, constraints: { format: "" }
    end
  end
  get "/world/posts",
      to: "world_posts#index",
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
      post :share
    end
  end
  get "/world/friends",
      to: "world_friends#index",
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
      get :invite_url
      post :pause
      post :unpause
    end
  end
  get "/world/join_requests",
      to: "world_join_requests#index",
      constraints: { format: %w[html json] },
      export: true
  resources :world_join_requests,
            path: "/world/join_requests",
            only: :destroy,
            constraints: { format: "json" },
            export: true
  get "/world/invitations",
      to: "world_invitations#index",
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
      get "manifest.webmanifest", action: :manifest, constraints: { format: "" }
    end
  end
  scope controller: :users, constraints: { format: "html" } do
    get "/@:id", action: :show, as: :user, export: true
    get "/@:id/join", action: :join
  end
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
            only: %i[index create],
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
  scope controller: :universe, export: { namespace: "universe" } do
    get "/universe", action: :show, constraints: { format: "html" }
    get "/universe/worlds",
        action: :worlds,
        constraints: { format: "json" }
    get "/universe/manifest.webmanifest",
        action: :manifest,
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
  post "/canny/sso_token",
       to: "canny#sso_token",
       constraints: { format: "json" },
       export: true

  # == Policies
  get "/policies",
      to: "policies#show",
      constraints: { format: "html" },
      export: true

  # == Pages
  root "landing#show", export: true
  scope constraints: { format: "html" } do
    get "/src",
        to: redirect("https://github.com/hulloitskai/smallerworld", status: 302)
    get "/sentry",
        to: redirect("https://smallerworld.sentry.io/issues/", status: 302)
    get "/feedback",
        to: "feedback#redirect",
        export: true
    get "/analytics",
        to: redirect(
          "https://app.amplitude.com/analytics/smallerworld/home",
          status: 302,
        )
  end

  # == Devtools
  if Rails.env.development?
    scope export: { namespace: "test" } do
      get "/test", to: "test#show", constraints: { format: "html" }
      post "/test/submit", to: "test#submit", constraints: { format: "json" }
    end
    get "/mailcatcher",
        to: redirect("//localhost:1080", status: 302),
        constraints: { format: "html" }
  end
end
