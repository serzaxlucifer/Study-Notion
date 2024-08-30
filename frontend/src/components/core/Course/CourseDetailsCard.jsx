import React from "react";
import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { BsFillCaretRightFill } from "react-icons/bs";
import StripeCheckout from "react-stripe-checkout";
import { FaShareSquare } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../../../slices/cartSlice";
import { ACCOUNT_TYPE } from "../../../utils/constants";
import { addCart } from "../../../services/operation/courseDetailAPI";
import { purchaseDirectly } from "../../../services/operation/studentFeaturesAPI";

const CourseDetailsCard = ({
	course,
	setConfirmationModal,
	handleBuyCourse,
}) => {
	const { user } = useSelector((state) => state.profile);
	const { token } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const authToken = token;

	const {
		thumbnail: ThumbnailImage,
		price: CurrentPrice,
		_id: courseId,
	} = course;

	const product = course;

	const makePayment = async (token) => {
		const body = {
			token,
			product,
		};
		const headers = {
			"Content-Type": "application/json",
		};

		const paymentResponse = await fetch(
			`http://localhost:4000/api/v1/payment/pay`,
			{
				method: "POST",
				headers,
				body: JSON.stringify(body),
			}
		)
			.then((response) => {
				console.log("RESPONSE ", response);
				const { status } = response;
				console.log("STATUS ", status);
			})
			.catch((error) => console.log(error));

		await purchaseDirectly({ courseId }, authToken, navigate, dispatch);

		return paymentResponse;
	};

	const handleShare = () => {
		copy(window.location.href);
		toast.success("Link copied to clipboard");
	};

	// const buyFinal = async () => {
	//   await addCart({courseId}, token)
	//   dispatch(addToCart(course))
	// }

	const handleAddToCart = async () => {
		if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
			toast.error("You are an Instructor. You can't buy a course.");
			return;
		}
		if (token) {
			await addCart({ courseId }, token);
			dispatch(addToCart(course));
			return;
		}
		setConfirmationModal({
			text1: "You are not logged in!",
			text2: "Please login to add To Cart",
			btn1Text: "Login",
			btn2Text: "Cancel",
			btn1Handler: () => navigate("/login"),
			btn2Handler: () => setConfirmationModal(null),
		});
	};
	return (
		<>
			<div
				className={`flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5`}>
				{/* Course Image */}
				<img
					src={ThumbnailImage}
					alt={course?.courseName}
					className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
				/>

				<div className="px-4">
					<div className="space-x-3 pb-4 text-3xl font-semibold">
						Rs. {CurrentPrice}
					</div>
					<div className="flex flex-col gap-4">
						{/* <button
              className="cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 bg-yellow-50"
              onClick={
                user && course?.studentsEnrolled.includes(user?._id)
                  ? () => navigate("/dashboard/enrolled-courses")
                  : handleBuyCourse
              }
            >
              {user && course?.studentsEnrolled.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"}
            </button> */}
						{token ? (
							<StripeCheckout
								token={makePayment}
								name="Buy Course"
								amount={product.price}
								stripeKey={process.env.REACT_APP_STRIPE_PKEY}>
								<button
									className="cursor-pointer gap-x-2 rounded-md py-2 w-full px-5 font-semibold text-richblack-900 bg-yellow-50"
									onClick={
										user &&
										course?.studentsEnrolled.includes(user?._id) &&
										navigate("/dashboard/enrolled-courses")
									}>
									{user && course?.studentsEnrolled.includes(user?._id)
										? "Go To Course"
										: "Buy Now"}
								</button>
							</StripeCheckout>
						) : (
							<button
								className="cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 bg-yellow-50"
								onClick={
									user && course?.studentsEnrolled.includes(user?._id)
										? () => navigate("/dashboard/enrolled-courses")
										: handleBuyCourse
								}>
								{user && course?.studentsEnrolled.includes(user?._id)
									? "Go To Course"
									: "Buy Now"}
							</button>
						)}
						{(!user || !course?.studentsEnrolled.includes(user?._id)) && (
							<button
								onClick={handleAddToCart}
								className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
								Add to Cart
							</button>
						)}
					</div>
					<div>
						<p className="pb-3 pt-6 text-center text-sm text-richblack-25">
							30-Day Money-Back Guarantee
						</p>
					</div>

					<div className={``}>
						<p className={`my-2 text-xl font-semibold `}>
							This Course Includes :
						</p>
						<div className="flex flex-wrap gap-3 text-sm text-caribbeangreen-100">
							{course?.tag?.map((item, i) => {
								return (
									<p className={`flex gap-2`} key={i}>
										<BsFillCaretRightFill />
										<span>{item}</span>
									</p>
								);
							})}
						</div>
					</div>
					<div className="text-center">
						<button
							className="mx-auto flex items-center gap-2 py-6 text-yellow-100 "
							onClick={handleShare}>
							<FaShareSquare size={15} /> Share
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CourseDetailsCard;
