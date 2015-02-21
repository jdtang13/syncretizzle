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
  		@posts = generate_choices(category[:social_media]).sort_by { |p| p.upvotes - p.downvotes}

  		# wait for people to vote...

  		first = @posts[0]

  		# CLASSICS picker
  		@room.current_stage = 2

  		@posts = generate_choices(category[:classics]).sort_by { |p| p.upvotes - p.downvotes}

  		# wait for people to vote....

  		second = @posts[0]

  		# MERGING phase
  		@room.current_stage = 3

  		content = MarkovController.generate(first.text, second.text)
  		@result = Post.new(:content => content)

  	end

  end
end
