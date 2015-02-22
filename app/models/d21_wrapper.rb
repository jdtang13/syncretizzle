require 'httparty'

class D21_Wrapper
	include HTTParty
	base_uri 'https://apisandbox.d21.me'

	#returns access token
	def initialize(email)
		url = "/token"
		query = { :email => email }
		result = HTTParty.post(url, :query => query )
		return result["token"]
	end

	#return choices for a certain poll
	def getChoices(token, pollnum)
		url = "/polls/#{pollnum}"
		headers = { 'Content-Type' => 'application/json',
			'Authorization' => 'Bearer #{token}'}
		response = HTTParty.get(url, :headers => headers)
		result = response['choices']
		return result
	end

	#choices is a hash of size 20 - 10 for facebook, 10 for literature
	#key: choice token; value: output result
	def vote(token, pollnum, choices)
		url = "/polls/#{pollnum}/vote"
		headers = { 'Content-Type' => 'application/json',
			'Authorization' => 'Bearer #{token}'}
		array = Array.new
		choices.each do |key, value| 
			entry = Hash.new
			entry['choice'] = key
			entry['kind'] = value
			array.push(entry)
		end
		result = HTTParty.post(url, {:headers => headers, :body => array.to_json})
		return result
	end

end