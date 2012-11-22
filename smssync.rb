require 'rubygems'
require 'sinatra'
require 'json'

gem 'dm-core'
gem 'dm-timestamps'
gem 'dm-migrations'
gem 'dm-serializer'

require 'dm-core'
require 'dm-timestamps'
require 'dm-migrations'
require 'dm-serializer'

DataMapper.setup(:default, "sqlite3:///#{Dir.pwd}/smssync.db")

class Message
  include DataMapper::Resource

  property :id, Serial
  property :msg, Text
  property :tel, String

  property :created_at, DateTime
  property :validated_at, DateTime

  property :is_valid, Boolean, :default => false
  property :is_example, Boolean, :default => false

  def to_json(args)
    output = {
      :id => self.id,
      :msg => self.msg,
      :date => self.created_at,
      :is_valid => self.is_valid,
      :is_example => self.is_example
    }
    output[:phone_messages] = Message.all(:tel => self.tel).size
    output[:phone_valid_messages] = Message.all(:tel => self.tel, :is_valid => true).size
    output
  end
end

class Bucket
  include DataMapper::Resource

  property :id, Serial
  property :created_at, DateTime

  property :version, Integer
end

DataMapper.finalize

configure do
  set :public_folder, 'yeoman/dist/'
  set :static, true
end

get '/' do

  begin
    @bucket = Bucket.first
  rescue
    DataMapper.auto_migrate!
    @bucket = Bucket.new
    @bucket.save
  end

  if params['device'] == 'gateway'
    Message.create :msg => params['text'], :tel => params['tel']
  else
    send_file File.expand_path('yeoman/dist/index.html', '.')
  end

end

get '/selected_messages' do
end

get '/examples.json' do
  return Message.all(:is_example => true).to_json
end

get '/new_messages.json' do
  return Message.all(:validated_at => nil).to_json
end

post '/accept/:message' do
  msg = Message.get(:message)
  if msg
    msg.update(:is_valid => true, :validated_at => Time.now)
    return {:status => "ok"}.to_json
  else
    not_found
  end
end

post '/reject/:message' do
  msg = Message.get(:message)
  if msg
    msg.update(:is_valid => false, :validated_at => Time.now)
    return {:status => "ok"}.to_json
  else
    not_found
  end
end

get '/create_dummies' do
  Message.create(:msg => "text1", :tel => "001122334455")
  Message.create(:msg => "text2", :tel => "001122334455")
  Message.create(:msg => "text3", :tel => "001122334455")
  Message.create(:msg => "text4", :tel => "001122334455")
end
