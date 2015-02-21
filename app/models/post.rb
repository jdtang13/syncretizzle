class Post < ActiveRecord::Base

	has_one :room
	has_many :post #children?

end
