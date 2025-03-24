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
    collection do
      post :cleared
    end
    member do
      post :delivered
    end
  end

  # == Logins
  resource :login,
           only: :new,
           path_names: { new: "" },
           export: { namespace: "login" }

  # == Signups
  defaults export: { namespace: "signup" } do
    resource :signup,
             only: %i[new create],
             path_names: { new: "" }
    get :edit, to: "signups#edit"
    post :edit, to: "signups#update"
  end

  # == World
  resource :world, only: :show, export: { namespace: "world" }

  # == Friends
  resources :friends, only: :index, path: "/world/friends", export: true
  resources :friends, only: %i[create update destroy], export: true do
    member do
      post :pause
    end
  end

  # == Friend notification settings
  resource :friend_notification_settings, only: %i[show update], export: true

  # == Users
  get "/@:handle", to: "users#show", as: :user_page, export: true
  resources :users, only: [], export: true do
    member do
      get "manifest.webmanifest" => :manifest, constraints: { format: "" }
      post :request_invitation
    end
  end

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

  # == Join requests
  resources :join_requests,
            path: "/world/join_requests",
            only: :index,
            export: true

  # == Pages
  defaults export: true do
    root "landing#show"
    get :home, to: redirect("/world")
    get :start, to: "start#show"
  end
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
