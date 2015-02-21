class MarkovController < ApplicationController
	#select a word from a given array of words and their probability distribution
	def select_word(hash)
		puts "SELECTING WORD"
		cumu_hash = Hash.new
		cumu = 0
		hash.each do |key, value|
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
	end

	#generate a line based on Markov assumption using prior and posterior probabilities
	def line_generate(length, word_collection, trans_table, prior_prob)
		result = ""
		prev = ""
		for i in 1..length
			if i == 1 then
				word = select_word(prior_prob)
			else
				if !trans_table.key?(prev) then
					word = word_collection.to_a.sample
				else
					word = select_word(trans_table[prev])
				end
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

	def process_line(entry, word_collection, trans_table, prior_prob)
		words = entry.split(" ")
		#store all words into word_collection
		word_collection.add(words)

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
		total = 0
		arr.each_value do |entry|
			if entry.kind_of? Integer
				total += entry
			end
		end
		arr.each_key do |key|
			arr[key] = arr[key] / total.to_f
		end
	end


	# always use this function
	def generate(arr1, arr2)
		require 'set'
		#length can be random
		blength = 10
		length = rand(3) + blength

		#go through each array, separate into words, and create transition probabilities 
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
		return line_generate(length, word_collection, trans_table, prior_prob)
	end

end
