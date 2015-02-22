class WelcomeController < ApplicationController

  	def index

	  	@user = current_or_guest_user
	  	@room = current_room

	  	# note: only scrape data from pages that are listed as public (e.g., friends who made public statuses, pages to follow, public group posts)

	  	# TODO: send this off to firebase!!
	  	@first_round = generate_choices(@user, :facebook)
	  	@second_round = generate_choices(@user, :classics)

  		# launch firebase interface
  		# seed firebase with data: usernames, blocks of text. controller needs to send all of this to firebase
  		

  		# firebase and browser interact continuously to play the game

  		# game has finished, now firebase sends the data to controller
	  	# TODO: get this selection set from firebase!!
	  	first = @first_round.sample(5)
	  	second = @second_round.sample(5)

 		# controller processes and saves the results, sends it to MarkovController
  		# markov is generated in final screen for all to view, saved to database

  		arr = generate(first, second)

		@content = arr[0]
		@title = arr[1].titleize

	  	@processed = ""

	 	#@processed.gsub!(" i ", " I ")

	 	newline = "<br />"

	 	min_line = 5
	 	max_line = 10
	 	rng = Random.new

	 	# build lines slowly
	 	current_line = ""
	 	count = 0
	 	i = 0
	 	for word in @content.split(" ")

	 		if (word == "i")
	 			word = "I"
	 		end

	 		current_line << word + " "

	 		if (word.match(/[?.,;:-]/) or count > max_line)

		 		current_line << newline
	 			current_line[0] = current_line[0].capitalize
	 			@processed << current_line

	 			current_line = ""
	 			count = 0
	 		end

	 		count += 1
	 		i += 1

	 	end

	 	@processed.gsub!(/[,.;:-]? *<br \/> *$/, ".")

	 	@result = Post.new(:content => @processed)

	 	Post.where(source: 1).destroy_all # erase all facebook posts at the end of every cycle

  	end

  	# Note: you need to mash F5 for this strategy to work; does not update on-screen, must manually refresh.
  	def refresh

	  	# wait for updates... refresh the room size continuously

	  	if (@room.current_stage == 0 or @room.current_stage == nil)

	  		if (@room.users.size == room_max_size)

		  		# begin the games automatically
		  		# FACEBOOK picker
		  		@room.current_stage = 1

		  		# generate choices
		  		@posts = generate_choices(category[:facebook]).sort_by { |p| p.upvotes - p.downvotes }
	  		end

		end

		if (@room.current_stage == 1)

	  		# wait for people to vote...

	  		first = @posts[0]

	  		# CLASSICS picker
	  		# onclick, trigger this
	  		@room.current_stage = 2

	  		@posts = generate_choices(category[:classics]).sort_by { |p| p.upvotes - p.downvotes }

	  	end

	  	if (@room.current_stage == 2)
	  		# wait for people to vote....

	  		second = @posts[0]

	  		# MERGING phase
	  		# onclick, trigger this
	  		@room.current_stage = 3

	  	end

	  	if (@room.current_stage == 3)

	  		content = MarkovController.generate(first.text, second.text)
	  		@result = Post.new(:content => content)

	  	end

  	end

  end
