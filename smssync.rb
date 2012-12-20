# encoding: utf-8

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

#log = File.new("sinatra.log", "a")
#STDOUT.reopen(log)
#STDERR.reopen(log)

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
  property :is_favorite, Boolean, :default => false

  has n, :selections, :through => Resource

  def to_json(args)
    output = {
      :id => self.id,
      :msg => self.msg,
      :date => self.created_at,
      :hours => self.created_at.strftime("%H:%M"),
      :is_valid => self.is_valid,
      :is_favorite => self.is_favorite,
      :is_hidden => self.tel.empty?
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
  set :static, true
end


# ====
# Main
# ====

get '/' do

  if params['device'] == 'gateway'
    Message.create :msg => params['text'], :tel => params['phone']
  else
    send_file File.expand_path('public/index.html', '.')
  end

end

# ==========
# Stats JSON
# ==========

get '/stats.json' do

  stats = {
    :messages => Message.count,
    :selected_messages => 0,
    :selections => Selection.count,
    :favorites => Message.count(:is_favorite => true),
  }


  stats[:selections_details] = []
  Selection.all.each do |selection|
    messages = selection.messages.size
    stats[:selected_messages] += messages
    stats[:selections_details] << {
      :id => selection.id,
      :messages => messages,
      :created_at => selection.created_at
    }
  end

  messages = Message.all
  stats[:messages_details] = {
    :first => {
      :id => messages.first.id,
      :created_at => messages.first.created_at
    },
    :last => {
      :id => messages.last.id,
      :created_at => messages.last.created_at
    },
    :count_5m => []
  }
  current_date = messages.first.created_at
  last_date = messages.last.created_at
  current_count = 1
  messages.each do |msg|
    if (msg.created_at.to_time.to_i - current_date.to_time.to_i) < 500
      current_count += 1
    else
      stats[:messages_details][:count_5m] << current_count
      current_count = 1
      current_date = msg.created_at
    end
  end

  return stats.to_json
end

# =============
# Messages JSON
# =============

get '/selected.json' do
  selection = Selection.last
  return {:id => selection.id, :messages => selection.messages}.to_json
end

get '/recents.json' do
  return Message.all(:validated_at => nil, :limit => 100).to_json
end

get '/favorites.json' do
  return Message.all(:is_favorite => true).to_json
end

get '/all.json' do
  return Message.all(:is_valid => true, :limit => 1000).to_json
end

# ================
# Messages Actions
# ================

post '/messages/:id' do

  msg = Message.get(params[:id])
  not_found unless msg

  case params[:action]
  when "select"
    msg.update(:is_valid => true, :validated_at => Time.now)
    selection = Selection.last
    selection.messages << msg
    selection.save
  when "favorite"
    msg.update(:is_favorite => true)
  when "unfavorite"
    msg.update(:is_favorite => false)
  when "reject"
    selection = Selection.last
    selection.messages.delete(msg)
    selection.save
    msg.update(:is_valid => false, :validated_at => Time.now)
  end

  return {:status => "ok"}.to_json

end

# =================
# Selection Actions
# =================

get '/messages.txt' do
  selection = Selection.last
  messages = selection.messages
  return "&vMessageListe=#{messages.map{|m| m.msg}.join('|').gsub("&", "et")}\n&vTxt_version=#{Selection.last.id}"
end

post '/selection' do
  Selection.create
end

# ====
# Misc
# ====

get '/create_dummies' do
  Message.create(:msg => "Vu des montage de Kinect (camera usb aussi) sur trépied si ça peut aider, faut contact ML tetalab, sinon je vois pas trop", :tel => "007")
  Message.create(:tel => "007", :msg => "@tetalab sinon, vous faites un projet pour empreint numérique cette année ?")
  Message.create(:tel => "007", :msg => "ouep, nickel un court panorama :)")
  Message.create(:tel => "007", :msg => "#FF les assos présentes au #capitoledulibre le samedi 24/10, notamment @Wikimedia_Fr, @framasoft, @OSM_FR et #tetaneutral avec @lguerby")
end
