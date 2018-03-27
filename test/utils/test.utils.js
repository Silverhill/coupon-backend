const utils = {
  async callToQraphql(request, query, token) {
    let post = null;
    if (token) {
      post = await request.post('/graphql')
        .set('Accept', 'application/json')
        .set('authentication', `${token}`)
        .send(query)
    } else {
      post = await request.post('/graphql')
        .set('Accept', 'application/json')
        .send(query)
    }

    return post;
  }
}

module.exports = utils;


