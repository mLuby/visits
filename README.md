# Current

## Challenge

Using any technologies you choose, to design and host a simple API that accepts user location webhooks and can be queried with a search string or a visit ID.

## Context

Current uses a location service provider to help match where a user is when they use their Current card. This reduces fraud and leads to a more more intelligent receipt. This is implemented by being notified whenever a user enters a venue, and then when the card is used, matching the merchant string we receive from Visa with a recently entered venue.

## Requirements

1. This API must be available on a public endpoint you control
2. This API must expose the following two endpoints
   1. POST /visit
      1. Accepts POST requests with `application/json` types
      2. The schema for submitted objects is as follows
         1. userId – the user that is submitting the location
         2. name – the name of the location
         3. Returns a visitId which can be referenced in the GET. Visit IDs are globally unique to the location submission
   2. GET /visit
      1. Can be queried with either of the following patterns:
         1. visitId
         2. both of the following two query params:
            1. userId
            2. searchString- A string which is attempted to be matched over the 5 most recent locations the user has visited. The matching should be fuzzy, and case insensitive
      2. Returns an array of arrival objects that was submitted to the POST

## Delivery

Once you complete the API, please email me with the public endpoint and a link to a github repository of the code. Trevor will test the endpoint after submission and report the results.

## Example Timeline

```js
POST /visit { userId: "user1", name: "McDonald's" }
return { visitId: "some-visit-id-1" }
```
```js
GET /visit?visitId=some-visit-id-1
return [{ userId: "user1", name: "McDonald's", visitId: "some-visit-id-1" }]
```
```js
POST /visit { userId: "user1", name: "Starbucks" }
return { visitId: "some-visit-id-2" }
```
```js
GET /visit?userId=user1&searchString=MCDONALD'S LAS VEGAS
return [{ userId: "user1", name: "McDonald's", visitId: "some-visit-id-1" }]
```
```js
POST /visit { userId: "user2", name: "Starbucks" }
return { visitId: "some-visit-id-3" }
```
```js
GET /visit?userId=user2&searchString=APPLE
return <nothing>
```
