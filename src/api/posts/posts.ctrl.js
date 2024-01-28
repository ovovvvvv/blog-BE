import Post from '../../models/post.js';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
    const { id } = ctx.params;
    console.log(id);
    if (!ObjectId.isValid(id)) {
        ctx.status = 400;
        return;
    }
    try {
        const post = await Post.findById(id);
        //포스트가 존재하지 않을때
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.state.post = post;
        return next();
    } catch (e) {
        ctx.throw(500, e);
    }
}

export const checkOwnPost = (ctx, next) => {
    const { user, post } = ctx.state;
    if (post.user._id.toString() !== user._id) {
        ctx.status = 403;
        return;
    }
    return next();
};


// 포스트 작성
export const write = async ctx  => {
    const schema = Joi.object().keys({
        // 객체가 다음 필드를 가지고 있음을 검증해줌
        title : Joi.string().required(), // required가 있으면 필수항목
        body: Joi.string().required(),
        tags: Joi.array()
            .items(Joi.string())
            .required(), // 문자열로 이루어진 배열
    });

    // 검증하고 나서 검증 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;  // Bad request
        ctx.body = result.error;
        return;
    }
    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title, 
        body,
        tags,
        user: ctx.state.user,
    });

    try{
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

// 포스트 전체 조회
export const list = async ctx => {
    const page = parseInt(ctx.query.page || '1', 10);

    if (page < 1) {
        ctx.status = 400;
        return;
    }

    const { tag, username } = ctx.query;
    // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const query = {
        ...(username ? {'user.username' :  username } : {}),
        ...(tag ? {tags : tag} : {}),
    };

    try {
        const posts = await Post.find(query)
        .sort({_id: -1})
        .limit(10)
        .skip((page - 1) * 10)
        .lean()
        .exec();
        const postCount = await Post.countDocuments(query).exec();
        // countDocuments =  MongoDB에서 Post 모델의 문서 수를 가져오는 Mongoose 메서드
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts.map(post =>({
                ...post,
                body:
                    post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
            }));
    } catch (err) {
        ctx.throw(500, err);
    }
};

// 특정 포스트 조회
export const read = async ctx => {
   ctx.body = ctx.state.post;
};

// 포스트 삭제
export const remove = async ctx => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndDelete(id).exec();
        ctx.status = 204; // No Content (성공하긴 했지만 응답할 데이터는 없음)
    } catch (e) {
        ctx.throw(500, e);
    }
};



// 포스트 수정
export const update = async ctx => {
    const {id} = ctx.params;

    const schema = Joi.object().keys({
        // 객체가 다음 필드를 가지고 있음을 검증해줌
        title : Joi.string(), // required가 있으면 필수항목
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    // 검증 후 실패인 경우 에러 처리
    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

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


