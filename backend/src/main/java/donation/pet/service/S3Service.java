package donation.pet.service;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.util.IOUtils;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
@NoArgsConstructor
public class S3Service {

    private AmazonS3 s3Client;

    // application.properties or yml 파일에서 정보를 가져옵니다.
    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static}")
    private String region;

    // 클라우드 프론트 사용을 위한 도메인 이름 지정
    public static final String CLOUD_FRONT_DOMAIN_NAME = "dh5000fovb2wz.cloudfront.net";

    @PostConstruct
    public void setS3Client() {
        AWSCredentials credentials = new BasicAWSCredentials(this.accessKey, this.secretKey);

        s3Client = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(this.region)
                .build();
    }

    // 파일 업로드
    public String uploadFile(MultipartFile file) throws IOException {
        // 고유한 key 값을 갖기위해 현재 시간을 postfix 로 붙여줌
        SimpleDateFormat date = new SimpleDateFormat("yyyyMMddHHmmssSSS");
        String fileName = date.format(new Date()) + "_" + file.getOriginalFilename();

        // 파일 업로드
        byte[] bytes = IOUtils.toByteArray(file.getInputStream());
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(bytes.length);
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes);

        s3Client.putObject(new PutObjectRequest(bucket, fileName, byteArrayInputStream, metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead));

        return fileName;
    }

    // 파일 삭제
    public void deleteFile(String fileName) throws IOException {
        if ("default.gif".equals(fileName)) {
            return;
        }

        boolean isExistObject = s3Client.doesObjectExist(bucket, fileName);

        if (isExistObject) {
            s3Client.deleteObject(bucket, fileName);
        }
    }

}