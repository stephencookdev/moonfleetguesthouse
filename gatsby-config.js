module.exports = {
  siteMetadata: {
    title: "Moonfleet",
    email: "moonfleetguesthouse@icloud.com",
    telephone: "07572 743 951",
    mainNav: [
      { href: "/room-rates/", title: "Room Rates" },
      { href: "/find-us/", title: "Find Us" },
      { href: "/gallery/", title: "Gallery" },
      { href: "/contact-us/", title: "Contact" },
      { href: "/local-attractions/", title: "Things To Do" },
      { href: "/visitors-comments/", title: "Reviews" },
      { href: "/dogs/", title: "Dogs" }
    ]
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: "gatsby-plugin-netlify-cms",
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`
      }
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: `pages`
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ]
};
