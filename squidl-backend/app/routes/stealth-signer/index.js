

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {*} done
 */
export const stealthSignerRoutes = (app, _, done) => {
  app.post('/get-meta-address', async (request, reply) => {
    try {
      const { auth } = request.body;

      console.log('auth', auth);

      return reply.status(200).send({
        message: "Meta Address",
        error: null,
        data: null,
      });
    } catch (error) {
      console.log(error);
      return reply.status(500).send({
        message: "Internal Server Error",
        error: error,
        data: null,
      });
    }
  })

  done();
}