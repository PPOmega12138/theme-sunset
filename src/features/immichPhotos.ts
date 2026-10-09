export interface ImmichAlbum{
  id: string;
  name: string;
  description: string | null;
  assetCount: number;
}

export interface ImmichTimeBucket{
  timeBucket: string;
  count: number;
}

export interface ImmichAsset{
  id: string;
  isImage: boolean;
  ratio: number;
  thumbnailUrl: string;
  previewUrl: string;
  originalUrl: string;
}

interface ImmichUrlPara{
  immichUrl: string;
  slug: string;
}

function parseShareUrl(sharedUrl: string):ImmichUrlPara{
  const url = new URL(sharedUrl.trim());
  const match = url.pathname.match(/^(.*)\/s\/([^/]+)\/?$/);

  if(!match){throw new Error("Immich 共享图库地址格式错误");}

  const [,basePath,slug]= match;
  return{
    immichUrl: `${url.origin}${basePath}/api`,
    slug: decodeURIComponent(slug),
  }
}

function createApiUrl(
  urlPara: ImmichUrlPara,
  path: string,
  params: Record<string,string> = {}
):string {

  const searchParams = new URLSearchParams({
    slug: urlPara.slug,
    ...params,
  });
  
  return `${urlPara.immichUrl}${path}?${searchParams}`;
}

async function getJson<T>(url:string): Promise<T> {
  const response = await fetch(url);

  if(!response.ok){
    throw new Error(`Immich API 请求失败：${response.status}`);
  }
  
  return response.json() as Promise<T>
}

interface SharedAlbumResponse{
  id: string;
  albumName: string;
  description: string | null;
  assetCount: number;
}

interface SharedLinksResponse{
  album: SharedAlbumResponse | null;
}

interface BucketResponse{
  id: string[];
  isImage: boolean[];
  ratio: number[];
}

export function getImmichGallery(sharedUrl: string) {
  const urlPara = parseShareUrl(sharedUrl);

  async function getSharedAlbum():Promise<ImmichAlbum> {
    const url = createApiUrl(
      urlPara,
      "/shared-links/me",
    );

    const sharedLink = await getJson<SharedLinksResponse>(url);

    if(!sharedLink.album){
      throw new Error("该 Immich 分享链接不是相册类型");
    }

    return{
      id: sharedLink.album.id,
      name: sharedLink.album.albumName,
      description: sharedLink.album.description,
      assetCount: sharedLink.album.assetCount,
    };
  }

  function getTimeBuckets(albumId:string):Promise<ImmichTimeBucket[]>{
    const url = createApiUrl(
      urlPara,
      "/timeline/buckets",
      {
        albumId,
        order: "desc",
      },
    );

    return getJson<ImmichTimeBucket[]>(url);
  }

  async function getBucketAssets(
    albumId: string,
    timeBucket:string,
  ):Promise<ImmichAsset[]>{
    const normalizedTimeBucket = timeBucket.includes("T")
    ? timeBucket
    : `${timeBucket}T00:00:00.000Z`;

    const url = createApiUrl(
      urlPara,
      "/timeline/bucket",
      {
        albumId,
        order: "desc",
        timeBucket: normalizedTimeBucket,
      },
    );

    const bucket = await getJson<BucketResponse>(url);

    return bucket.id.map((id, index)=>({
      id,
      isImage: bucket.isImage[index],
      thumbnailUrl: createApiUrl(
        urlPara,
        `/assets/${id}/thumbnail`,
        {
          size: "thumbnail",
        },
      ),
      previewUrl: createApiUrl(
        urlPara,
        `/assets/${id}/thumbnail`,
        {
          size: "preview",
        },
      ),
      originalUrl: createApiUrl(
        urlPara,
        `/assets/${id}/original`,
      ),
      ratio: bucket.ratio[index],
    }));
  }

  return{
    getSharedAlbum,
    getTimeBuckets,
    getBucketAssets,
  }

  
}