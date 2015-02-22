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

end
