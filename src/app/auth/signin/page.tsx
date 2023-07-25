import Link from 'next/link';
import Footer from '../../../components/landing/footer';
import GoogleIcon from '@/assets/icons/googleIcon';
import NaverIcon from '@/assets/icons/naverIcon';
import GithubIcon from '@/assets/icons/githubIcon';

export default function SingIn() {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <div className="text-[5rem] font-black">모랜디</div>
        <div className="text-[1.5rem] font-bold">모두의 랜덤 디펜스</div>
        <div className="my-[2rem]">
          <Link href="/dashboard">
            <div className="flex flex-row justify-center items-center h-[4rem] w-[27rem] bg-[#F7F7FA] rounded-2xl text-black text-[1.2rem] mb-[1rem]">
              <GoogleIcon />
              <div className="ml-[0.5rem]">구글로 로그인하기</div>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-row justify-center items-center h-[4rem] w-[27rem] bg-[#03C75A] rounded-2xl text-white text-[1.2rem] mb-[1rem]">
              <NaverIcon />
              <div className="ml-[0.5rem]">네이버로 로그인하기</div>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-row justify-center items-center h-[4rem] w-[27rem] bg-gray-900 rounded-2xl text-white text-[1.2rem]">
              <GithubIcon />
              <div className="ml-[0.5rem]">깃허브로 로그인하기</div>
            </div>
          </Link>
        </div>
        <div className="mb-[2rem] text-gray-500">
          아직 모랜디 회원이 아니신가요?
        </div>
        <Link href="signup" className="text-[1.2rem]">
          회원가입
        </Link>
      </div>
      <Footer />
    </>
  );
}
