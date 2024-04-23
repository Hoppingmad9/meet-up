# meet-up
 
add your google maps api key to a .env

sample code to make it callable at the top, jsut add an endpoint and send it an array of people in JSON format

todo rate the picked location and then iterate the location based on that rating

tl;dr

`getLocationsFunc()` goes through each person object in `people` and turns the address into a lat/lng and 'google place id'

`getAverageLocation()` then averages the lat/lng of all the people

`calculateRoutes()` then gets the route for each mode of transport listed for each person in `people[x].modes`

`rateLocation()` currently just gets the fastest mode of transport for each person and then console.logs the average time and max time
//todo is for it then to use that to output a rating
//todo use that rating as input to a function to "guess a better location" (nearer the furthest person/use all the times to find a better "middle" of the group/etc)
//todo iterate that process until no gain or an acceptable solution found

`getPlace()` then gets a bar within 500m of that picked location