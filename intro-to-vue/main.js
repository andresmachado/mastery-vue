//Create a new component for product-details with a prop of details. 
let eventBus = new Vue();

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
});

Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
      <b>Please correct the following error(s):</b>
      <ul>
        <li v-for="error in errors">{{error}}</li>
      </ul>
    </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name">
      </p>
      
      <p>
        <label for="review">Review:</label>
        <textarea v-model="review" id="review"></textarea>
      </p>
      <p>
        <label for="ratings">Rating:</label>
        <select v-model.number="rating" name="rating" id="ratings">
          <option value="5" selected>5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
         </select>
       </p>
       <p>
         <label for="recommend">Would you recommend this product?</label>
         <p style="margin: 0"><input v-model="recommend" id="recommend_yes" style="width: inherit;" type="radio" name="recommend" value="Yes"><span style="vertical-align: super;">Yes</span></p>
         <p style="margin: 0"><input v-model="recommend" id="recommend_no" style="width: inherit;" type="radio" name="recommend" value="No"><span style="vertical-align: super;">No</span></p>
        </p>
      <p>
        <input type="submit" value="Submit">
       </p>
    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: [],
    }
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        };
        eventBus.$emit('review-submitted', productReview);
        this.name = null;
        this.review = null;
        this.rating = null;
        this.recommend = null
      } else {
        if (!this.name) this.errors.push("Name required");
        if (!this.review) this.errors.push("Review required");
        if (!this.rating) this.errors.push("Rating required");
        if (!this.recommend) this.errors.push("Rating required");
      }
    }
  },
});

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    },
    cart: {
      type: Number,
      required: true
    }
  },
  template: `
   <div class="product">
        
      <div class="product-image">
        <img :src="image" />
      </div>

      <div class="product-info">
          <h1>{{ product }}</h1>
          <p v-if="inStock">In Stock</p>
          <p v-else>Out of Stock</p>
          <p>Shipping: {{ shipping }}</p>

          <product-details :details="details"></product-details>

          <div class="color-box"
               v-for="(variant, index) in variants" 
               :key="variant.variantId"
               :style="{ backgroundColor: variant.variantColor }"
               @mouseover="updateProduct(index)"
               >
          </div> 

          <button v-on:click="addToCart" 
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
          Add to cart
          </button>
          
          <button v-on:click="removeFromCart" 
            :disabled="!cart"
            :class="{ disabledButton: !cart }"
            >
          Remove Item
          </button>
       </div>
      
      <product-tabs :reviews="reviews"></product-tabs>
     
      </div>
   `,
  data() {
    return {
      product: 'Socks',
      brand: 'Vue Mastery',
      selectedVariant: 0,
      details: ['80% cotton', '20% polyester', 'Gender-neutral'],
      reviews: [],
      variants: [
        {
          variantId: 2234,
          variantColor: 'green',
          variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
          variantQuantity: 10
        },
        {
          variantId: 2235,
          variantColor: 'blue',
          variantImage: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
          variantQuantity: 0
        }
      ],
    }
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart')
    },
    removeFromCart() {
      this.$emit('remove-from-cart')
    },
    updateProduct(index) {
      this.selectedVariant = index
    },
  },
  computed: {
    title() {
      return this.brand + ' ' + this.product
    },
    image() {
      return this.variants[this.selectedVariant].variantImage
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity
    },
    shipping() {
      if (this.premium) {
        return "Free"
      }
      return 2.99
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
});

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
     <span class="tab"
           v-for="(tab, index) in tabs" 
           :key="index" 
           @click="selectedTab = tab" 
           :class="{activeTab: selectedTab === tab}"
       >
        {{tab}}
        </span>
        
         <div v-show="selectedTab === 'Reviews'" class="product-reviews">
            <h2>Reviews</h2>
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
              <li v-for="(review, index) in reviews" @key="index">
                <p>Name: {{review.name}}</p>
                <p>Review: {{review.review}}</p>
                <p>Rating: {{review.rating}}</p>
                <p>Recommend?: {{review.recommend }}</p>
              </li>
            </ul>
          </div>
          <product-review v-show="selectedTab === 'Make a Review'"></product-review>
    </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review"],
      selectedTab: "Reviews"
    }
  }
});

Vue.config.devtools = true;
const app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: 0
  },
  methods: {
    updateCart: function (remove) {
      if (remove) {
        this.cart--
      } else {
        this.cart++
      }
    }
  }
});