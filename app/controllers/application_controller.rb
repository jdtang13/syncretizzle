class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def category(name)

  	case name
  	when :facebook
  		return "SM"
  	when :classics
  		return "CL"
  	when :journalism
  		return "JN"
  	when :genre_fiction
  		return "GF"
  	else
  		return "zero"
  	end

  end

def query_size
	return 10
end

  helper_method :generate_choices
  def generate_choices(user, category)

      posts = []

      case category
      when :facebook

        # feed in public statuses from groups, celebrities, and the few people who make public statuses
        # volunteer your own statuses

        # TODO: get this data from facebook!
          posts = Post.where(source: 1)
          posts = posts.sample(10)

       # todo: twitter support? maybe voters choose between facebook and twitter?

      when :classics

          #find 10 random posts with source = 0 (0 is classics)
          posts = Post.where(source: 0)
          posts = posts.sample(10)

      when :journalism

          #posts are the top 10-15 headlines from newspapers in mashery

      else

      end
      
      return posts
  end


helper_method :room_max_size
def room_max_size
	return 4
end

helper_method :current_or_guest_user
# if user is logged in, return current_user, else return guest_user
  def current_or_guest_user
    if current_user
      if session[:guest_user_id] && session[:guest_user_id] != current_user.id
        logging_in
        guest_user(with_retry = false).try(:destroy)
        session[:guest_user_id] = nil
      end
      current_user
    else
      guest_user
    end
  end

  # find guest_user object associated with the current session,
  # creating one as needed
  def guest_user(with_retry = true)
    # Cache the value the first time it's gotten.
    @cached_guest_user ||= User.find(session[:guest_user_id] ||= create_guest_user.id)

  rescue ActiveRecord::RecordNotFound # if session[:guest_user_id] invalid
     session[:guest_user_id] = nil
     guest_user if with_retry
  end

  private

  # called (once) when the user logs in, insert any code your application needs
  # to hand off from guest_user to current_user.
  def logging_in
    # For example:
    # guest_comments = guest_user.comments.all
    # guest_comments.each do |comment|
      # comment.user_id = current_user.id
      # comment.save!
    # end
  end

  def create_guest_user
    u = User.create(:email => "guest_#{Time.now.to_i}#{rand(100)}@example.com")
    u.save!(:validate => false)
    session[:guest_user_id] = u.id
    u
  end


  def exit_room
  	current_or_guest_user.room.remove(current_or_guest_user)
  	current_or_guest_user.room = nil
  end


helper_method :current_or_new_room
# if user is logged in, return current_user, else return guest_user
  def current_room
    if current_or_guest_user != nil and current_or_guest_user.room != nil
      current_or_guest_user.room
    else
      next_room
    end
  end

  # returns the first open room with less than 4 members, or creates a new one
  def next_room(with_retry = true)
    # Cache the value the first time it's gotten.

    if (Room.last != nil and Room.last.users.count < room_max_size)
      @cached_next_room = Room.last
      session[:next_room_id] = @cached_next_room.id
      current_or_guest_user.room = @cached_next_room
    else
      @cached_next_room = create_new_room.id
    end

  rescue ActiveRecord::RecordNotFound # if session[:next_room_id] invalid
     #session[:next_room_id] = nil
     #next_room if with_retry
     @cached_next_room = create_new_rom.id
  end

  def create_new_room
    r = Room.create(:current_stage => 0)
    r.save!(:validate => false)

    r.users << (current_or_guest_user)
    session[:next_room_id] = r.id
    current_or_guest_user.room = r
    r
  end

  # JERRY'S MARKOV CODE !!!

	#checks if letter
	def letter?(lookAhead)
		lookAhead =~ /[A-Za-z]/
	end
	#select a word from a given array of words and their probability distribution
	def select_word(prev, hash, bg_trans_table)
		#puts "SELECTING WORD"

		#if using background trans table, create new trans table and set hash to it
		#if entry in bg table exists then use that entry, otherwise
		#use existing entry
		hash2 = Hash.new
		hash.each_key do |key|
			if !bg_trans_table[prev].nil? && !bg_trans_table[prev][key].nil? then
				hash2[key] = bg_trans_table[prev][key]
				#hash2[key] = hash[key]
			else 
				hash2[key] = hash[key]
			end
		end

		normalize_arr(hash2)

		cumu_hash = Hash.new
		cumu = 0
		# hash2.each do |key, value|
		# 	puts "KEY: "
		# 	puts key
		# 	puts "VALUE: "
		# 	puts value
		# 	cumu += value
		# 	cumu_hash[key] = cumu
		# end

		hash2.each do |key, value|
			puts "KEY: "
			puts key
			puts "VALUE: "
			puts value
			cumu += value
			cumu_hash[key] = cumu
		end


		prob = rand()
		cumu_hash.each do |key, value|
			if prob < value then
				return key
			end 
		end
		return ""
	end

	#generate a line based on Markov assumption using prior and posterior probabilities
	def line_generate(length, word_collection, trans_table, prior_prob, bg_trans_table)
		result = ""
		prev = ""
		for i in 1..length
			if i == 1 then
				word = select_word("", prior_prob, bg_trans_table)
			else
				if !trans_table.key?(prev) then
					word = word_collection.to_a.sample
				else
					word = select_word(prev, trans_table[prev], bg_trans_table)
				end
			end

			if word.nil? then
				break
			end
			if prev.include?(".") then
				word = word.capitalize
			end
			puts "----------"
			puts i
			puts "-----------"
			puts word
			result = result + " " + word.to_s
			prev = word
			next
		end

		return result
	end

	#simplified version of process_line, only calculates transition
	def process(data, trans_table)
		newentry = data.downcase.gsub(/[^a-z0-9\s'\.,;-]/i, '')
		words = newentry.split(" ")

		prev = ""
		words.each do |word|
			if prev == "" then 
				next
			end
			# store trans probs
			if !trans_table.has_key?(prev) then
				trans_table[prev] = Hash.new
			end
			if !trans_table[prev].has_key?(word) then
				trans_table[prev][word] = 1
			else
				trans_table[prev][word] += 1
			end
			prev = word
		end
	end

	def process_line(entry, word_collection, trans_table, prior_prob)

		newentry = entry.downcase.gsub(/[^a-z0-9\s'\.,;-]/i, '')
		words = newentry.split(" ")
		#store all words into word_collection
		word_collection.merge(words)

		prev = ""
		words.each do |word|
			#if first word, then store in prior probs and continue
			if prev == "" then 
				if !prior_prob.has_key?(word) then
					prior_prob[word] = 1
				else
					prior_prob[word] += 1
				end
				prev = word
				next
			end

			# store trans probs
			if !trans_table.has_key?(prev) then
				trans_table[prev] = Hash.new
			end
			if !trans_table[prev].has_key?(word) then
				trans_table[prev][word] = 1
			else
				trans_table[prev][word] += 1
			end

			prev = word
		end
	end

	def normalize_table(table)
		table.each do |key, value| 
			total = 0
			value.each do |key2, value2|
				if value2.kind_of? Integer
					total += value2
				end
			end

			value.each do |key2, value2|
				value[key2] = value2 / total.to_f
			end
		end
	end

	def normalize_arr(arr)
		total = 0.0
		arr.each_value do |entry|
			if (entry.kind_of?(Integer) || entry.kind_of?(Float)) then
				total += entry
			end
		end
		arr.each_key do |key|
			arr[key] = arr[key] / total.to_f
		end
	end

	def get_trans_table
		require 'set'
		trans_table = Hash.new
		data = File.read('poem_training.txt')
		process(data, trans_table)
		normalize_table(trans_table)
		return trans_table
	end


	def generate(arr1, arr2)
		require 'set'
		#length can be random
		blength = 50
		length = rand(10) + blength

		#go through each array, separate into words, and create transition probabilities 
		bg_trans_table = get_trans_table
		word_collection = Set.new
		trans_table = Hash.new
		prior_prob = Hash.new
		arr1.each do |entry|
			process_line(entry, word_collection, trans_table, prior_prob)
		end
		arr2.each do |entry|
			process_line(entry, word_collection, trans_table, prior_prob)
		end

		#normalize necessary structure
		normalize_table(trans_table)
		normalize_arr(prior_prob)

		#generate line
		result = line_generate(length, word_collection, trans_table, prior_prob, bg_trans_table)
		return result
	end


end
