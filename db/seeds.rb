# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

File.readlines('db/classics.txt').map do |line|
	unless (line.empty?)

		#line_new = line.gsub /"/, ''
		post = Post.new(:content => line, :source => 0)
		post.save
	end
end

posts = Post.create([

           { content: "We all admire you so much for your courageous fight with Meningitis. You are an example and an inspiration to all of us.", source: 1 },
           { content: "Thanks to everyone who came out to see us Thursday and Friday! We hope you had as much fun watching as we did playing for you, and shoutout to our Thursday audience birthdays.", source: 1},
          { content: "If you're a proponent of gay marriage and would like to see a liberal religious view, feel free to read it as well.", source: 1 },
          { content: "I was in Egypt during the Arab Spring when the Mubarak government got overthrown. I was building an amusement park called the Mubarak Family Park.", source: 1 },
          { content: "Planning on renting a place on Airbnb for 14 weeks, but at that point Airbnb takes $1k in fees which is too much imo. I think I should contact the host outside of Airbnb but not sure how to get his contact info. Has anyone done this?", source: 1 },
          { content: "Who the fuck egged my grandpas car? You are a sad piece of shit what are we in highschool", source: 1 },
          { content: "My family was planning on dragging me to visit relatives tonight, which had been planned for weeks but they only just told me. When I asked why they didn't tell me sooner, my mom said 'you didn't ask did you?'", source: 1 },
          { content: "My talent is eating an entire day's worth of calories and then complain that I am still hungry. Because I need two day's worth of calories to be full.", source: 1 },
          { content: "Few things can get me up at 10 am for a lecture. That said, I was so enchanted hearing from Queen Noor this morning.", source: 1 },
          { content: "Dear George RR. Martin, I said I wanted The Winds of Winter, not the winds of winter!", source: 1 },
          { content: "Just got banned from posting comments on our student newspaper", source: 1 },
          { content: "My friend and I whipped up a nutrient rich pizza for Jane's 20th. We had to order dominos to Ronald's steakhouse house . Happy belated birthday son", source: 1 },

           ])