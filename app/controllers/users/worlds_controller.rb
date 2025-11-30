# typed: true
# frozen_string_literal: true

module Users
  class WorldsController < Worlds::ApplicationController
    include RendersManifestIcons
    include RendersWorldFavicons

    # == Actions ==

    # GET /world?intent=(installation_instructions|install)
    def show
      respond_to do |format|
        format.html do
          world = current_world or next redirect_to(new_registration_path)
          latest_friends = world.friends
            .reverse_chronological
            .where.associated(:push_registrations)
            .distinct
            .select(:id, :created_at, :emoji)
            .first(3)
          if latest_friends.size < 3
            latest_friends += world.friends
              .reverse_chronological
              .where.missing(:push_registrations)
              .distinct
              .select(:id, :created_at, :emoji)
              .first(3 - latest_friends.size)
          end
          render(
            inertia: "UserWorldPage",
            world_theme: world.theme,
            props: {
              "faviconLinks" => world_favicon_links(
                world,
                except_apple_touch_icon: true,
              ),
              world: WorldSerializer.one(world),
              "latestFriendEmojis" => latest_friends.map(&:emoji),
              "pendingJoinRequests" => world.join_requests.pending.count,
              "pendingInvitations" => world.invitations.pending.count,
              "hasAtLeastOneUserCreatedPost" =>
                world.posts.user_created.exists?,
            },
          )
        end
      end
    end

    # GET /world/edit
    def edit
      respond_to do |format|
        format.html do
          world = current_world or next redirect_to(new_registration_path)
          render(
            inertia: "UserEditWorldPage",
            world_theme: world.theme,
            props: {
              world: WorldSerializer.one(world),
            },
          )
        end
      end
    end

    # PUT /world
    def update
      respond_to do |format|
        format.json do
          world = current_world!
          world_params = params.expect(world: [
            :icon,
            :theme,
            :hide_stats,
            :hide_neko,
            :allow_friend_sharing,
            owner_attributes: %i[name allow_space_replies],
          ])
          if world.update(**world_params)
            owner = world.owner!
            render(json: {
              world: WorldSerializer.one(world),
              owner: UserSerializer.one(owner),
            })
          else
            render(
              json: { errors: world.form_errors },
              status: :unprocessable_content,
            )
          end
        end
      end
    end
  end
end
