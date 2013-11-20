require 'test_helper'

class TestsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get run" do
    get :run
    assert_response :success
  end

end
