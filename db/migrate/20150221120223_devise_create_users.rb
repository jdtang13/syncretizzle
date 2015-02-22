class DeviseCreateUsers < ActiveRecord::Migration
  def change


    create_table :rooms do |t|

      t.integer :poll_id_first
      t.integer :poll_id_second

      t.integer :current_stage

      t.timestamps
    end

    create_table(:users) do |t|

      t.belongs_to :room, index: true

      t.integer :room_id
      
      t.string :uid
      t.string :provider

      t.string :name
      t.string :image
      t.string :password

      ## Database authenticatable
      t.string :email,              :null => false, :default => ""
      t.string :encrypted_password, :null => false, :default => ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      t.integer  :sign_in_count, :default => 0
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip

      ## Confirmable
      # t.string   :confirmation_token
      # t.datetime :confirmed_at
      # t.datetime :confirmation_sent_at
      # t.string   :unconfirmed_email # Only if using reconfirmable

      ## Lockable
      # t.integer  :failed_attempts, :default => 0 # Only if lock strategy is :failed_attempts
      # t.string   :unlock_token # Only if unlock strategy is :email or :both
      # t.datetime :locked_at

      ## Token authenticatable
      # t.string :authentication_token


      t.timestamps
    end

    add_index :users, :email,                :unique => true
    add_index :users, :reset_password_token, :unique => true
    # add_index :users, :oauth_token,   :unique => true
    # add_index :users, :confirmation_token,   :unique => true
    # add_index :users, :unlock_token,         :unique => true
    # add_index :users, :authentication_token, :unique => true

    create_table :posts do |t|
      t.belongs_to :room, index: true
      t.references :parent, index: true

      t.integer :source
      t.integer :generation
      t.text :content

      t.timestamps
    end
    
  end
end
