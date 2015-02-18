
require 'sinatra'
require 'erubis'


############# Config/Settings ############### 
# Use escaped ERuby
set :erb, :escape_html => true


# root
get '/' do
  'Hello Nuwe!'
end

# Television screen
get '/dashboard' do
  'This is a dashboard'
end


############# OAuth ############### 
# Auth in using omniauth with Nuwe

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
  'This is a login page'
end