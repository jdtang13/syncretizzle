class Post < ActiveRecord::Base

	belongs_to :room

	has_many :children, class_name: "Post", foreign_key: "parent_id" #children
	belongs_to :parent, class_name: "Post"

end
