# encoding: utf-8

gem 'multi_json', '=1.7.8'

require 'rubygems'
require 'sinatra'
require 'json'
require 'date'
require 'net/http'

gem 'dm-core'
gem 'dm-timestamps'
gem 'dm-migrations'
gem 'dm-serializer'

require 'dm-core'
require 'dm-timestamps'
require 'dm-migrations'
require 'dm-serializer'

require 'nokogiri'
require 'yaml'

#log = File.new("sinatra.log", "a")
#STDOUT.reopen(log)
#STDERR.reopen(log)

# ============
# Esendex conf
# ============

if File.file? "esendex.yml"
  esendex_conf = YAML.load_file("esendex.yml")
end

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

  property :list_index, Integer, :default => 0

  has n, :selections, :through => Resource

  def to_json(args)
    output = {
      :id => self.id,
      :msg => self.msg,
      :date => self.created_at,
      :hours => self.created_at.strftime("%H:%M"),
      :is_valid => self.is_valid,
      :is_favorite => self.is_favorite,
      :is_hidden => self.tel.empty?,
      :list_index => self.list_index
    }
    output[:phone_messages] = Message.all(:tel => self.tel).size
    output[:phone_valid_messages] = Message.all(:tel => self.tel, :is_valid => true).size
    output
  end

  def to_epoch
    @created_at.to_time.to_i 
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

get '/gource.log' do

  messages = []
  
  8.times do |i|

    date_start = DateTime.new(2012, 12, 15 + i, 17, 30)
    end_date = DateTime.new(2012, 12, 15 + i, 19, 30)
    date_epoch = date_start.to_time.to_i

    Message.all(:is_valid => true, :created_at.gt => date_start, :created_at.lt => end_date).each do |msg|

      path = "#{date_start.strftime "%d_%m_%Y"}/"

      if msg.is_valid
        path += "#{msg.selections.first.id}"
      else
        path = ""
      end

      path += "/#{msg.msg}"

      # Let them eat cake
      # http://www.colourlovers.com/palette/49963/let_them_eat_cake
      # background: 774F38
      colors = ["ECE5CE", "E08E79", "F1D4AF", "C5E0DC"]

      # (◕_”_◕)
      # http://www.colourlovers.com/palette/848743/(%E2%97%95_%E2%80%9D_%E2%97%95)
      # background: 490A3D
      colors = ["8A9B0F", "BD1550", "F8CA00", "E97F02"]

      color = colors[0]

      text = msg.msg
      if text =~ /aime|amour|<3/i
        color = colors[1]
      elsif text =~ /epous|mari|femme/i
        color = colors[2]
      elsif text =~ /anniversaire|paix|reve/i
        color = colors[3]
      end

      date = msg.to_epoch - date_epoch
      messages << [date, msg.tel, "A", path, color].join("|")

    end

  end

  messages.sort! do |a, b|
    a.split("|")[0].to_i <=> b.split("|")[0].to_i
  end

  return messages.join "\n"
end

get '/stats.json' do

  stats = {
    :messages => Message.count,
    :selected_messages => 0,
    :selections => Selection.count,
    :favorites => Message.count(:is_favorite => true),
  }

  stats[:words] = {}
  stats[:words][:aime] = Message.all.reject{|msg| msg.msg.index("aime").nil?}.size +
                         Message.all.reject{|msg| msg.msg.index("amour").nil?}.size +
                         Message.all.reject{|msg| msg.msg.index("<3").nil?}.size
  stats[:words][:marriage] = Message.all.reject{|msg| msg.msg.index("epou").nil?}.size +
                             Message.all.reject{|msg| msg.msg.index("mari").nil?}.size +
                             Message.all.reject{|msg| msg.msg.index("femme").nil?}.size
  stats[:words][:anniversaire] = Message.all.reject{|msg| msg.msg.index("anniversaire").nil?}.size
  stats[:words][:paix] = Message.all.reject{|msg| msg.msg.index("paix").nil?}.size
  stats[:words][:reve] = Message.all.reject{|msg| msg.msg.index("rêve").nil?}.size

  first_date = DateTime.new(2012, 12, 15)
  stats[:by_day] = {
    :testing => {
      :messages => Message.all(:created_at.lt => first_date).size,
      :selections => Selection.all(:created_at.lt => first_date).size
    },
    :days => []
  }
  9.times do |day|
    selections = Selection.all(:created_at.gt => first_date, :created_at.lt => first_date + 1)
    selected = 0
    message_count = Message.all(:created_at.gt => first_date, :created_at.lt => first_date + 1).size
    selections.each do |selection|
      selected += selection.messages.size
    end

    average = 0
    ratio = 0
    if selected != 0
      average = (selected.to_f / selections.size.to_f ).to_i
      ratio = ((selected.to_f / message_count.to_f ) * 100).to_i
    end

    stats[:by_day][:days] << {
      :messages => message_count,
      :selected => selected,
      :selections => selections.size,
      :average_selection => average,
      :ratio_selected => ratio
    }
    first_date += 1
  end


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

  stats[:morris] = []
  today_messages = Message.all(:created_at.gt => Date.today)

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
  return Message.all(:is_valid => true).to_json
end

get '/latest.json' do
  return Message.all(:is_valid => true, :limit => 4, :order => [:created_at.desc]).to_json
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

    if params[:list_index]
      msg.update(:list_index => params[:list_index])
    end

    selection = Selection.last
    selection.messages << msg
    selection.save

  when "change_list"
    msg.update(:list_index => params[:list_index])
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

get %r{/messages_(\d+).txt} do |list_index|
  selection = Selection.last
  messages = selection.messages.all(:list_index => list_index)
  return "&vMessageListe=#{messages.map{|m| m.msg}.join('|').gsub("&", "et")}\n&vTxt_version=#{Selection.last.id}&list_index=#{list_index}"
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

# ====
# Esendex
# ====

get '/fetch_messages' do

  auth = esendex_conf["auth"]
  http = Net::HTTP.new('api.esendex.com', 80)

  req = Net::HTTP::Get.new('/v1.0/inbox/messages')
  req.basic_auth auth["login"], auth["pass"]
  response = http.request(req)
  doc = Nokogiri.XML(response.body)

  count = doc.at('messageheaders').attribute('count').text().to_i

  if count > 0

    doc.css('messageheader').each do |message|

      body_uri = message.at('body').attribute('uri').text.gsub("http://api.esendex.com", "")
      req = Net::HTTP::Get.new(body_uri)
      req.basic_auth auth["login"], auth["pass"]
      response = http.request(req)

      body = Nokogiri.XML(response.body)
      esendex_id = message.attribute('id').text

      Message.create(
        :msg => body.at("bodytext").text,
        :tel => message.at('from phonenumber').text
      )

      #req = Net::HTTP::Delete.new("/v1.0/inbox/messages/#{esendex_id}")
      #req.basic_auth auth["login"], auth["pass"]
      #response = http.request(req)

    end

  end

  return 200
end


get '/send_messages' do
  Net::HTTP.start('api.esendex.com', 80) {|http|
    req = Net::HTTP::Post.new('/v1.0/messagedispatcher')
    req.basic_auth '', ''
    response = http.request(req)
    return response.body
  }
end
