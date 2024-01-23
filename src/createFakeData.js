import Post from './models/post.js';

export default function createFakeData() {
    // 0, 1, ... 39로 이루어진 배열을 생성한 후 포스트 데이터로 변환
    const posts = [...Array(40).keys()].map(i => ({
        title: `포스트 # ${i}`,
        body:
        `It is a long established fact that a reader will be
        distracted by the readable content of a page when looking
        at its layout. The point of using Lorem Ipsum is that 
        it has a more-or-less normal distribution of letters, 
        as opposed to using 'Content here, content here', 
        making it look like readable English. Many desktop
        publishing packages and web page editors now use
        Lorem Ipsum as their default model text, and a search for 
        'lorem ipsum' will uncover many web sites still in 
        their infancy. Various versions have evolved over the years, 
        sometimes by accident, sometimes on purpose 
        (injected humour and the like).`,
        tags: ['가짜', '데이터'],
    }));
    Post.insertMany(posts)
        .then(docs => {
            console.log(docs);
        })
        .catch(err => {
            console.error(err);
        });
}