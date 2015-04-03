
require 'sinatra'
require 'erubis'
require 'nuwe'

############# Config/Settings ############### 
# Use ERuby
set :erb, :escape_html => false
set :public_folder, './public'

#Nuwe.configure do |c|
 # c.token = "8723ee8e-848c-481b-8c6b-e43e0f325283"
#end

# root
get '/' do
  erb :dashboard
end

# Television screen
get '/dashboard' do
  erb :dashboard
end

get '/setup' do
	erb :setup
end

############# Session accesss ############### 
# Sign up
get '/sign_up' do
	erb :sign_up
end
# Login
get '/sign_in' do
	erb :sign_in
end

# Logout
get '/log_out' do
	'OK'
end


get '/test' do 
	#Nuwe::Auth.create "me@example.com", "supersecret"
end

############# OAuth ############### 
# Auth in using omniauth with Nuwe
