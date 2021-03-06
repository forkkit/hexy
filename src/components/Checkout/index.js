import React, { useState, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { StripeProvider, Elements, stripe } from 'react-stripe-elements'
import { db } from '../../config/firebaseconfig'
import { humanize, setLocalStorage } from '../../utils/helpers'
import CardForm from './CardForm'
import ScrollToTop from '../ScrollToTop'
import './Checkout.scss'

const Checkout = ({ cart, setCart, setProfileUpdated, currentUser }) => {
    const [status, setStatus] = useState('default')
    const [couponInput, setCouponInput] = useState('')
    const [currentCoupon, setCurrentCoupon] = useState()
    const [updatedPrice, setUpdatedPrice] = useState()
    const [couponError, setCouponError] = useState()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handleClearCart = () => {
        setCart()
        localStorage.removeItem('hexy_cart')
    }

    let desc

    if (
        (cart && cart.accountType === 'pro') ||
        (cart && cart.accountType === 'pro_unlimited')
    ) {
        desc = <div>(includes 1 year of Hexy Pro features & support)</div>
    } else if (cart && cart.accountType === 'pro_lifetime') {
        desc = <div>(one-time payment/lifetime Hexy Pro access)</div>
    } else {
        desc = null
    }

    const handleCouponInput = event => {
        setCouponInput(event.target.value)
    }

    const handleCoupon = () => {
        if (!couponInput) {
            alert('Please enter a coupon code.')
            return
        }
        let couponRef = db.collection('coupons').doc(couponInput)
        let getDoc = couponRef
            .get()
            .then(doc => {
                if (!doc.exists) {
                    // console.log('No such document!')
                    setCouponError("Sorry, that's not a valid coupon.")
                } else {
                    setCurrentCoupon(doc.data())
                    // console.log('Document data:', doc.data())
                }
            })
            .catch(err => {
                // console.log('Error getting document', err)
                setCouponError(err)
            })
    }

    useEffect(() => {
        const handleDiscount = () => {
            // console.log(currentCoupon)
            if (currentCoupon && currentCoupon.used) {
                // console.log('currentCoupon.used')
                setCouponError('Sorry, that coupon is no longer valid.')
                return
            } else if (currentCoupon && !currentCoupon.used) {
                // console.log('coupon valid')
                let discountValue = parseFloat(currentCoupon.value) / 100.0
                let discount = cart.price * discountValue
                let newPrice = cart.price - discount
                setUpdatedPrice(newPrice.toFixed(2))
                setCouponInput('')
                const newCart = { ...cart, total: newPrice.toFixed(2) }
                setCart(newCart)
                setLocalStorage('hexy_cart', newCart)
            } else {
                console.log('no coupon')
            }
        }
        handleDiscount()
    }, [currentCoupon])

    return (
        <StripeProvider apiKey="pk_test_Q8j9ieOEWFZAnuSox9yqNyrG">
            <div className="checkout">
                <h1>Checkout</h1>

                {cart && status !== 'complete' ? (
                    <Fragment>
                        <div className="cart-table">
                            <table>
                                <thead>
                                    <tr>
                                        <td>Item</td>
                                        <td>Price</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="table-main">
                                        <td>
                                            {cart ? (
                                                <span>
                                                    Hexy Account:{' '}
                                                    <strong>
                                                        {humanize(
                                                            cart.accountType
                                                        )}
                                                    </strong>
                                                </span>
                                            ) : null}
                                            {cart && desc}
                                        </td>
                                        <td>
                                            {cart && cart.price ? (
                                                <span>${cart.price}</span>
                                            ) : null}
                                        </td>
                                    </tr>
                                    <tr className="coupon-code">
                                        <td>
                                            <div className="coupon-content">
                                                <label htmlFor="coupon">
                                                    Coupon Code:
                                                </label>
                                                <input
                                                    name="coupon"
                                                    type="text"
                                                    value={couponInput}
                                                    onChange={handleCouponInput}
                                                />
                                                <button
                                                    className="button"
                                                    onClick={handleCoupon}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            <div className="coupon-feedback">
                                                {currentCoupon &&
                                                    currentCoupon.used !==
                                                        true && (
                                                        <span className="success">
                                                            Your coupon has been
                                                            applied!
                                                        </span>
                                                    )}
                                                {couponError && (
                                                    <span className="error">
                                                        {couponError}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td />
                                    </tr>
                                    <tr className="table-total">
                                        <td>
                                            {cart && cart.price ? (
                                                <strong>Total: </strong>
                                            ) : null}
                                        </td>
                                        <td>
                                            <span className="total-price">
                                                {cart && cart.total ? (
                                                    <span>
                                                        $
                                                        {updatedPrice ? (
                                                            <Fragment>
                                                                <span className="strikethrough">
                                                                    {cart.price}
                                                                </span>
                                                                &nbsp; $
                                                                {updatedPrice}
                                                            </Fragment>
                                                        ) : (
                                                            cart.total
                                                        )}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button
                                className="clear-cart button"
                                onClick={handleClearCart}
                            >
                                Clear Cart
                            </button>
                        </div>
                        <Elements>
                            <CardForm
                                cart={cart}
                                setCart={setCart}
                                stripe={stripe}
                                status={status}
                                setStatus={setStatus}
                                setProfileUpdated={setProfileUpdated}
                                currentUser={currentUser}
                                currentCoupon={currentCoupon}
                                setCurrentCoupon={setCurrentCoupon}
                                couponError={couponError}
                            />
                        </Elements>
                    </Fragment>
                ) : (
                    <div className="cart-empty">
                        <ScrollToTop />
                        {status !== 'complete' ? (
                            <div>
                                <h3>Your cart is empty.</h3>
                                <p>
                                    See our Hexy Pro{' '}
                                    <Link to="/pro">plans & pricing</Link>.
                                </p>
                            </div>
                        ) : (
                            <h3>
                                {status === 'complete'
                                    ? 'Purchase complete.'
                                    : status === 'completeFree'
                                    ? 'Upgrade complete.'
                                    : null}
                            </h3>
                        )}
                    </div>
                )}
                {status === 'complete' ? (
                    <div className="CheckoutForm-complete">
                        <ScrollToTop />
                        <h3>Payment successful. Thank you!</h3>
                        <p>
                            Go to your <Link to="/account">Account page</Link>{' '}
                            or <Link to="/colors">find more colors</Link>.
                        </p>
                    </div>
                ) : null}
                {status === 'completeFree' ? (
                    <div className="CheckoutForm-complete">
                        <ScrollToTop />
                        <h3>
                            Sweeetness! Your account has been upgraded. Thank
                            you!
                        </h3>
                        <p>
                            Go to your <Link to="/account">Account page</Link>{' '}
                            or <Link to="/colors">find more colors</Link>.
                        </p>
                    </div>
                ) : null}
            </div>
        </StripeProvider>
    )
}

export default Checkout
