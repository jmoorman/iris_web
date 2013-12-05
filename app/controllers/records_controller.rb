class RecordsController < ApplicationController
  def create
    @record = Record.new(record_params)
    if @record.save
      redirect_to(action: :index, notice: 'Upload successful')
    end
  end

  def destroy
  end

  def index
    @records = Record.all.order('records.date_taken desc')
  end

  def show
    @record = Record.find(params[:id])
  end

  private
    def record_params
      params.require(:record).permit(:user_id, :test_id, :subject, :date_taken, :score, :quality, :file)
    end
end
