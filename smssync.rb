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

# ======
# Models
# ======

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
  property :is_favorite, Boolean, :default => false

  has n, :selections, :through => Resource

  def to_json(args)
    output = {
      :id => self.id,
      :msg => self.msg,
      :date => self.created_at,
      :hours => self.created_at.strftime("%H:%M"),
      :is_valid => self.is_valid,
      :is_example => self.is_example,
      :is_favorite => self.is_favorite
    }
    output[:phone_messages] = Message.all(:tel => self.tel).size
    output[:phone_valid_messages] = Message.all(:tel => self.tel, :is_valid => true).size
    output
  end
end

class Selection
  include DataMapper::Resource

  property :id, Serial
  property :created_at, DateTime

  has n, :messages, :through => Resource
end

DataMapper.finalize

# init database if not already created
begin
  @selection = Selection.first
rescue
  DataMapper.auto_migrate!
  @selection = Selection.new
  @selection.save
end

# =============
# Configuration
# =============

configure do
  set :public_folder, 'yeoman/app/'
  set :static, true
end


# ====
# Main
# ====

get '/' do

  if params['device'] == 'gateway'
    Message.create :msg => params['text'], :tel => params['tel']
  else
    send_file File.expand_path('yeoman/dist/index.html', '.')
  end

end

# =============
# Messages JSON
# =============

get '/selected.json' do
  return Selection.last.messages.to_json
end

get '/examples.json' do
  return Message.all(:is_example => true).to_json
end

get '/recents.json' do
  return Message.all(:validated_at => nil).to_json
end

get '/favorites.json' do
  return Message.all(:is_favorite => true).to_json
end

# ================
# Messages Actions
# ================

post '/select/:message' do
  msg = Message.get(:message)
  if msg
    Selection.last.messages << msg
    return {:status => "ok"}.to_json
  else
    not_found
  end
end

post '/favorite/:message' do
  msg = Message.get(:message)
  if msg
    msg.update(:is_favorite => true)
    return {:status => "ok"}.to_json
  else
    not_found
  end
end

post '/accept/:message' do
  msg = Message.get(:message)
  if msg
    msg.update(:is_valid => true, :validated_at => Time.now)
    Selection.last.messages << msg
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

# =================
# Selection Actions
# =================

get '/messages.txt' do
  messages = Selection.last.messages
  return "&vMessageListe=#{messages.join('|')}\n&vTxt_version=#{Selection.last.id}"
end

post '/selection' do
  Selection.create
end

# ====
# Misc
# ====

get '/create_dummies' do
  Message.create(:msg => "text1", :tel => "001122334455")
  Message.create(:msg => "text2", :tel => "001122334455")
  Message.create(:msg => "text3", :tel => "001122334455")
  Message.create(:msg => "text4", :tel => "001122334455")
end
