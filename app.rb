
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
  'This is a dashboard'
end

############# Session accesss ############### 
# Sign up
get '/sign_up' do
  'This is the sign in page'
end
# Login
get '/log_in' do
  'This is a login page'
end
# Logout
get '/log_out' do
	'OK'
end

############# OAuth ############### 
# Auth in using omniauth with Nuwe
