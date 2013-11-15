class UsersController < ApplicationController
  skip_before_filter :signed_in_user, only: [:new, :create]
  #before_filter :correct_user, only: [:edit, :update]
  before_filter :admin_user, except: [:new, :create, :show, :home] 

  def home
    @user = current_user
  end
  
  def new
    @user = User.new
  end

  def show
    @user = User.find(params[:id])
    redirect_to current_user unless current_user?(@user) or current_user.admin?
  end

  def index
    @users = User.all
  end

  def create
    @user = User.new(user_params)
    if @user.save
      sign_in @user
      flash[:success] = "New user created"
      redirect_to root_url 
    else
      render 'new'
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      flash[:success] = "Profile updated"
      sign_in @user
      redirect_to @user
    else
      render 'edit'
    end
  end
  
  def destroy
    User.find(params[:id]).destroy
    flash[:success] = "User destroyed"
    redirect_to users_url
  end

  private
    def user_params
      params.require(:user).permit(:email, :password, :password_confirmation) 
    end

    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_path) unless current_user?(@user)
    end
end
