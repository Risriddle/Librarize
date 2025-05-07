# Librarize : My personal Library

This is a site that acts as a customized pdf reader for books. 


## Tech Stack

**Client:** Next js , Tailwind css
 
**Server:** Next js (server side components)

**Database:** MongoDB


## Features

- Book tracking according to months and years
- Quote and vocabulary saving/downloading.
- Integration of Imagix for storing cover images.
- Integration of AWS S3 for storing pdf files
- Integrated timer,dictionary in reader

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB_URI`
`AWS_ACCESS_KEY_ID`
`AWS_SECRET_ACCESS_KEY`
`AWS_S3_BUCKET_NAME`
`NEXT_PUBLIC_AWS_S3_DOMAIN`
`AWS_REGION`



## Run Locally

Clone the project

```bash
  git clone https://github.com/Risriddle/Librarize.git
```

Go to the project directory

```bash
  cd Librarize
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev 
```



## Link to the site

https://librarize.vercel.app/
