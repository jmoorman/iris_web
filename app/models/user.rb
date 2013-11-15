class User < ActiveRecord::Base
  has_secure_password
  
  before_save :create_remember_token

  VALID_EMAIL_REGEX = /[^@]+@[^@]+\.[A-Za-z0-9]+/
  validates :email, presence: true, 
            format: { with: VALID_EMAIL_REGEX }, uniqueness: true
  validates :password, presence: true, length: {minimum: 6}
  validates :password_confirmation, presence:true

  private
    
    def create_remember_token
      self.remember_token = SecureRandom.urlsafe_base64
    end 
end
