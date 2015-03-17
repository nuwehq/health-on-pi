
require 'sinatra'
require 'erubis'

############# Config/Settings ############### 
# Use ERuby
set :erb, :escape_html => false
set :public_folder, './public'

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

post '/sign_in' do
	puts 
end

# Logout
get '/log_out' do
	'OK'
end

############# OAuth ############### 
# Auth in using omniauth with Nuwe
