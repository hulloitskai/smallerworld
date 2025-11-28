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
    get "/422", action: :unprocessable_content
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

  # == PWA ==

  scope constraints: { format: "" } do
    scope path: "/worlds/:world_id", module: :worlds, as: :world do
      get "/manifest.webmanifest",
          to: "manifests#show",
          as: :manifest,
          export: { namespace: "worldManifests" }
    end
    scope module: :users, as: :user do
      get "/manifest.webmanifest",
          to: "manifests#show",
          as: :manifest,
          export: { namespace: "userManifest" }
      scope path: "/world", module: :worlds, as: :world do
        get "/manifest.webmanifest",
            to: "manifests#show",
            as: :manifest,
            export: { namespace: "userWorldManifest" }
      end
    end
  end

  # == Contact ==

  resource :contact_url, only: :show, export: { namespace: "contactUrl" }

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
    get "/login", action: :new, as: :new_session
    post "/login", action: :create, as: :session
    post "/logout", action: :destroy
  end

  # == Registrations ==

  scope controller: :registrations, export: true do
    get "/signup", action: :new, as: :new_registration
    post "/signup", action: :create, as: :registration
  end

  # == Start ==

  get "/start" => "start#redirect", export: true

  # == Worlds ==

  get "/@:id", to: "worlds#show", as: :world, export: true
  get "/@:id/join", to: "worlds#join"
  resources :worlds, only: [], export: true do
    scope module: :worlds  do
      resource :timeline, only: :show, export: { namespace: "worldTimelines" }
      resources :join_requests,
                only: :create,
                export: { namespace: "worldJoinRequests" }
      resources :activity_coupons,
                only: :index,
                export: { namespace: "worldActivityCoupons" }
      resources(
        :posts,
        only: :index,
        export: { namespace: "worldPosts" },
      ) do
        collection do
          get :pinned
        end
      end
    end
  end

  # == Spaces ==
  resources :spaces, only: %i[show], export: true do
    scope module: :spaces do
      # == Space Posts ==
      resources(
        :posts,
        only: %i[index create],
        export: { namespace: "spacePosts" },
      ) do
        collection do
          get :pinned
        end
      end
    end
  end
  namespace :spaces do
    resources :posts,
              only: %i[update destroy],
              export: { namespace: "spacePosts" }
  end

  scope module: :users, as: "user" do
    # == User World
    resource(
      :world,
      only: %i[show edit update],
      export: { namespace: "userWorld" },
    ) do
      scope module: :worlds do
        resources :activities,
                  only: %i[index create],
                  export: { namespace: "userWorldActivities" }
        resources :encouragements,
                  only: %i[index show],
                  export: { namespace: "userWorldEncouragements" }
        resources(
          :friends,
          only: %i[index create update destroy],
          export: { namespace: "userWorldFriends" },
        ) do
          member do
            get :invitation
            post :pause
            post :unpause
          end
        end
        resources :invitations,
                  only: %i[index create update destroy],
                  export: { namespace: "userWorldInvitations" }
        resources :join_requests,
                  only: %i[index destroy],
                  export: { namespace: "userWorldJoinRequests" }
        resources(
          :posts,
          only: %i[index create update destroy],
          export: { namespace: "userWorldPosts" },
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
      end
    end

    # == User Universe
    resource :universe, only: [], export: false do
      scope export: { namespace: "userUniverse" } do
        get :worlds
        get :posts
      end
    end
    get "/world/universe",
        to: "universes#show",
        as: :universe,
        export: { namespace: "userUniverse" }

    # == User Spaces
    resources(
      :spaces,
      path: "/world/spaces",
      only: %i[index create update],
      export: { namespace: "userSpaces" },
    )
  end

  # == Friend ==

  resource :friend, only: :update, export: { namespace: "friend" } do
    get :notification_settings

    # == Friend Encouragements
    scope module: :friends do
      resources :encouragements,
                only: :create,
                export: { namespace: "friendEncouragements" }
    end
  end

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
    resources :post_reactions,
              path: "/reactions",
              only: %i[index create],
              export: true
    resources :post_stickers,
              path: "/stickers",
              only: %i[index create],
              export: true
  end

  # == Post Reactions ==

  resources :post_reactions,
            only: :destroy,
            export: true

  # == Post Stickers ==

  resources :post_stickers,
            only: %i[update destroy],
            export: true

  # == Post Shares ==

  resources :post_shares, only: :show, export: true

  # == Activities Coupons ==

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
