// import cors from 'cors'
// import express from 'express'

// // const app = express()
// // const port = 3002

// // app.use(cors())
// // app.use(express.urlencoded({
// //   extended: true,
// // }))
// // app.use(express.json())

// // app.listen(port, () => {
// //   console.log(`listening on ${port}`)
// // })

const people = [
  {
    modes: ['driving', 'walking', 'transit'],
    address: "92 overstone road, w60ab",
    location: {},
    id: "",
    routes: []
  },
  {
    modes: ['bicyling', 'walking', 'transit'],
    address: "39 selwood way, hp135xr",
    location: {},
    id: "",
    routes: []
  }
]

const travelModes = ['driving', 'bicycling', 'walking', 'transit']

import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})

import * as dotenv from "dotenv"

dotenv.config()

const getLocationsFunc = async () => {
  await Promise.all(
    people.map(async (person) => {
      const geocodeArgs = {
        params: {
          key: process.env.GOOGLE_MAPS_API_KEY,
          address: person.address
        }
      }
      await client.geocode(geocodeArgs).then(gcResponse => {
        // console.dir(gcResponse.data.results[0].geometry.location)
        person.location = gcResponse.data.results[0].geometry.location
        person.id = gcResponse.data.results[0].place_id
      })
    })
  )
}

async function getPlace(placeLocation) {
  const placesNearbyArgs = {
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY,
      location: placeLocation,
      radius: 500,
      type: 'bar',
      maxprice: 2,
      opennow: true
    }
  }
  return await client.placesNearby(placesNearbyArgs).then(gcResponse => {
    return gcResponse.data.results[0]
  }).catch(gcError => {
    console.log(gcError.code)
    console.dir(gcError.response.data)
  })
}

function getAverageLocation(people) {
  const averageLat = people.reduce((total, next) => total + next.location.lat,0) / people.length
  const averageLng = people.reduce((total, next) => total + next.location.lng,0) / people.length
  return {lat: averageLat, lng: averageLng}
}

// function createDistanceMatrixRequestArgs(people, placeLocation) {
//   const distanceMatrixRequestArgs = []
//   travelModes.map((travelMode) => {
//     distanceMatrixRequestArgs[travelMode] = {
//       params: {
//         key: process.env.GOOGLE_MAPS_API_KEY,
//         mode: travelMode,
//         destinations: [placeLocation],
//         origins: people.filter((person)=>person.modes[travelMode]).map((person)=>person.location)
//       }
//     }
//   })
//   // console.dir(distanceMatrixRequestArgs, {depth: null})
//   return distanceMatrixRequestArgs
// }

async function calculateRoutes(people, place) {
  await Promise.all(
    people.map(async (person) => {
      person.routes = []
      await Promise.all(
        person.modes.map(async(travelMode) => {
          // console.log(travelMode)
          const routeArgs = {
            params: {
              key: process.env.GOOGLE_MAPS_API_KEY,
              mode: travelMode,
              origin: `place_id:${person.id}`,
              destination: place
            }
          }
          // console.log(routeArgs)
          await client.directions(routeArgs).then(gcResponse => {
            console.log(travelMode)
            console.log(gcResponse.data.routes[0].legs)
            person.routes.push({mode:travelMode, duration: gcResponse.data.routes[0].legs[0].duration, distance: gcResponse.data.routes[0].legs[0].distance})
          }).catch(gcError => {
            console.log(gcError.code)
            console.dir(gcError.response.data)
          })
        })
      )
    })
  )
}

function rateLocation(people) {
  let maxDuration = 0
  people.forEach((person) => {
    person.fastestRoute = getFastestRoute(person)
    if (person.fastestRoute.duration.value > maxDuration) {
      maxDuration = person.fastestRoute.duration.value
    }
    console.log(person.fastestRoute.duration.text)
  })
  const averageDuration = people.reduce((total, next) => total + next.fastestRoute.duration.value,0) /people.length
  console.log(averageDuration)
  console.log(maxDuration)
}

function getFastestRoute(person) {
  let fastestRoute = person.routes[0]
  for (let route of person.routes) {
    console.log(route.mode)
    console.log(route.duration.value)
    if (route.travelMode === 'bicycling' && route.distance.value > 20000) {
      continue
    }
    if (route.duration.value < fastestRoute.duration.value) {
      fastestRoute = route
    }
  }
  return fastestRoute
}


// await getLocationsFunc()

// let placeLocation = getAverageLocation(people)
// console.dir(placeLocation)

// // await calculateRoutes(people, 'ChIJG1HqDcoPdkgRTwo8Yz0e56U')
// await calculateRoutes(people, {lat:51.4931291, lng:-0.2257679})
// console.log(people)

// console.log(await getPlace({lat:51.4931291, lng:-0.2257679}))
// console.log('here')

// createDistanceMatrixRequestArgs(people, {lat:51.4931291, lng:-0.2257679})


// await getLocationsFunc()
// let placeLocation = getAverageLocation(people)


// await getPlace(placeLocation)


await getLocationsFunc()
let placeLocation = getAverageLocation(people)
await calculateRoutes(people, placeLocation)
rateLocation(people) // todo give rating based on "factors"
// todo iterate location based on rating
console.dir(await getPlace(placeLocation, {depth:null}))