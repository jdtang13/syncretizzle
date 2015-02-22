class WelcomeController < ApplicationController

  	def index

  		#refresh()
  		# ^^^note: don't do this, it only works if you mash f5

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

		@content = generate(first, second)

	  	@processed = ""

	 	#@processed.gsub!(" i ", " I ")

	 	newline = '<br />'

	 	@content = @content.gsub(/^ */, "")
	 	@content = @content.gsub(/[,;:-]$/, ".")

	  	if (@content.include?(". "))
		  	for string in @content.split(". ")

		  		tmp = string.gsub(" i ", " I ")
		  		#string.gsub!(/[,;:-]$/, ".")

		  		@processed << tmp.capitalize << "." << newline
		  	end
		  else 
		  	@processed = @content.capitalize
	 	end

	 	@processed[0] = @processed[0].capitalize

	 	@result = Post.new(:content => @processed)

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
