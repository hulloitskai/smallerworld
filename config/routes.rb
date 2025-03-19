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
  resource :contact_url, only: :show, export: true

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
  resource :login, only: :new, path_names: { new: "" }, export: true

  # == Signups
  resource :signup, only: %i[new create], path_names: { new: "" }, export: true
  get :edit, to: "signups#edit", export: true
  post :edit, to: "signups#update", export: true

  # == Friends
  resources :friends, only: %i[index create update], export: true do
    member do
      post :pause
    end
  end

  # == Friend notification settings
  resource :friend_notification_settings, only: %i[show update], export: true

  # == Users
  get "/@:handle", to: "users#show", as: :user_page, export: true
  resource :user, only: :update, export: true
  resources :users, only: [], export: true do
    member do
      get "manifest.webmanifest" => :manifest, constraints: { format: "" }
      get :posts
      post :request_invitation
    end
  end

  # == Posts
  resources :posts, only: %i[index create update destroy], export: true do
    member do
      get :stats
    end
  end

  # == Post reactions
  resources :post_reactions,
            path: "/posts/:post_id/reactions",
            only: %i[index create],
            export: true
  resources :post_reactions, only: :destroy, export: true

  # == Join requests
  resources :join_requests, only: :index, export: true

  # == Pages
  defaults export: true do
    root "landing#show"
    get :home, to: "home#show"
    get :start, to: "start#show"
  end
  get "/src" => redirect(
    "https://github.com/hulloitskai/smallerworld",
    status: 302,
  )

  # == Devtools
  if Rails.env.development?
    resource :test, controller: "test", only: :show, export: true do
      post :submit
    end
    get "/mailcatcher" => redirect("//localhost:1080", status: 302)
  end
end
