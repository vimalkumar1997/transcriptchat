/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
   images:{
    unoptimized:true
  },
}
 
module.exports = nextConfig

module.exports = {
  async redirects(){
    return [
      {
        permanent:true
      }
    ]
  }
}
module.exports = {
  devIndicators: false 
}