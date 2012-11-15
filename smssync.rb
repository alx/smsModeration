require 'rubygems'
require 'sinatra'

gem 'dm-core'
gem 'dm-timestamps'
gem 'dm-migrations'

require 'dm-core'
require 'dm-timestamps'
require 'dm-migrations'

DataMapper.setup(:default, "sqlite3:///#{Dir.pwd}/smssync.db")

class Message
  include DataMapper::Resource

  property :id, Serial
  property :text, String

  property :created_at, DateTime
  property :validated_at, DateTime

  property :is_valid, Boolean
  property :is_example, Boolean
end

class Bucket
  include DataMapper::Resource

  property :id, Serial
  property :created_at, DateTime
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
    Message.create :text => params['text']
  else
    send_file File.expand_path('index.html', settings.public)
  end

end

get '/selected_messages' do

end

get '/examples.json' do

end

post '/accept/:message' do
end

post '/reject/:message' do
end
