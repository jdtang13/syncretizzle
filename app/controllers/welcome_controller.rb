class WelcomeController < ApplicationController
  def index

  	@user = current_or_guest_user
  	@room = current_room

  	# wait for updates... refresh the room size continuously

  	if (@room.users.size == room_max_size)
  		# begin the games

  		# FACEBOOK picker
  		@room.current_stage = 1

  		# generate choices
  		@posts = generate_choices(category[:social_media])

  		# wait for people to vote...

  		first = get_most_popular(@posts)

  		# CLASSICS picker
  		@room.current_stage = 2

  		@posts = generate_choices(category[:classics])

  		# wait for people to vote....

  		second = get_most_popular(@posts)

  		# MERGING phase
  		@room.current_stage = 3

  		@result = markov(first, second)

  	end

  end
end
