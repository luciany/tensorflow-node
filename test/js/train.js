const assert = require('chai').assert;
const tf = require('../../index');
const mnist_data = require('mnist-data');
require('pyextjs'); const np = window.numpy;

class MnistData {
  next_batch() { return [1, 2]; }
}

class Mnist {
  constructor(train_count, test_count) {
    this.train = new MnistData(mnist_data.training(train_count));
    this.test = new MnistData(mnist_data.testing(test_count));
  }
}

describe("Tensorflow training", function() {

  describe("mnist", function() {
    it("should load mnist dataset", function() {
      const mnist = new Mnist(1000, 100);

      const g = new tf.Graph();
      const x = g.input(tf.float32, [-1, 784]);
      const y_ = g.input(tf.float32, [-1, 10]);

      const W = g.variable(np.zeros([784, 10]));
      const b = g.variable(np.zeros([10]));
      const y = g.matmul_add(x, W, b);

      loss = g.reduce_mean(g.nn.softmax_cross_entropy_with_logits(y, y_));
      train_step = g.train.GradientDescentOptimizer(0.5).minimize(loss);

      init = g.variable_initializers();
      sess = new tf.Session(g);
      sess.runNoOut(init);

      for(let i = 0; i < 10; i++) {
        [batch_xs, batch_ys] = mnist.train.next_batch(100);
        sess.run(train_step, [[x, batch_xs], [y_, batch_ys]]);
 
        correct_prediction = g.equal(g.argmax(y,1), g.argmax(y_,1));
        accuracy = g.reduce_mean(g.cast(correct_prediction, tf.float32));
        console.log(sess.run(accuracy, feed_dict={x: mnist.test.images, y_: mnist.test.labels}));
      }
    });
  });
});