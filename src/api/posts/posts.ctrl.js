import Post from '../../models/post.js';

// 포스트 작성
export const write = async ctx  => {
    const { title, body, tags} = ctx.request.body;
    const post = new Post({
        title, 
        body,
        tags,
    });
    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500,e);
    }
};

// 포스트 전체 조회
export const list = async ctx => {
    try {
        const posts = await Post.find().exec();
        ctx.body = posts;
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 특정 포스트 조회
export const read = async ctx => {
    const {id} = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if(!post) {
            ctx.status = 404; 
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

export const remove = async ctx => {
    const {id} = ctx.params;
    try {
        await Post.findByIdAndDelete(id).exec();
        ctx.status = 204; // No Content (성공하긴 했지만 응답할 데이터는 없음)
    } catch (e) {
        ctx.throw(500, e)
    }
};

export const update = async ctx => {
    const {id} = ctx.params;
    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new : true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
            // false 일때는 업데이트 되기 전의 데이터를 반환합니다.
        }).exec();
        if(!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};