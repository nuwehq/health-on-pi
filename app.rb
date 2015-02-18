
require 'sinatra'
require 'erubis'

############# Config/Settings ############### 
# Use ERuby
set :erb, :escape_html => false
set :public_folder, './public'

# root
get '/' do
  erb :index
end

# Television screen
get '/dashboard' do
  erb :dashboard
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

############# OAuth ############### 
# Auth in using omniauth with Nuwe
