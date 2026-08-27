/**
 * Enhanced Profile Dropdown - Works with existing Laravel JavaScript
 * Compatible with your existing .active and slide-in classes
 */

$(document).ready(function() {

    // Enhanced click handler for user profile box
    $(".userPbox:not(.for-sm)").click(function(event) {
        $(".profileTopBox").toggleClass("active");
        $("body").toggleClass("slide-in");
        event.stopPropagation();

        // Close any other open menus
        $(".menuTopBox").removeClass("active");
    });

    // Prevent profile box from closing when clicking inside (but allow the for-sm version to work)
    $(".profileTopBox").click(function(event) {
        event.stopPropagation();
    });

    // Enhanced back button handler
    $("#backProfile").click(function(event) {
        $(".profileTopBox").removeClass("active");
        $("body").removeClass("slide-in");
        event.stopPropagation();
    });

    // Enhanced outside click handler
    $(document).click(function(event) {
        // Check if the clicked element is not the profileTopBox or its descendants
        if (!$(event.target).closest(".profileTopBox, .userPbox:not(.for-sm)").length) {
            $(".profileTopBox").removeClass("active");
            $("body").removeClass("slide-in");
        }
    });

    // Handle category selection
    $("#myCategory").click(function(e) {
        e.preventDefault();
 
    });

    // Handle city selection
    $("#myCity").click(function(e) {
        e.preventDefault();
    });

    // Close dropdown on escape key
    $(document).keydown(function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            $(".profileTopBox").removeClass("active");
            $("body").removeClass("slide-in");
            $(".menuTopBox").removeClass("active");
        }
    });

    // Smooth scrolling for internal links
    $('a[href^="#"]').click(function(e) {
        e.preventDefault();
        var target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 500);
        }
    });

    // Add loading state to navigation links
    $('.userNav a[href]:not([href^="#"]):not([href^="javascript:"])').click(function() {
        $(this).addClass('loading');
        $(this).find('.userNavLable').append(' <i class="fas fa-spinner fa-spin"></i>');
    });

    // Handle responsive behavior
    function handleResponsive() {
        if ($(window).width() <= 768) {
            $('.profileTopBox').css('width', '100%');
        } else {
            $('.profileTopBox').css('width', '350px');
        }
    }

    // Call on load and resize
    handleResponsive();
    $(window).resize(handleResponsive);
    
    // Handle menu toggle (if you have a hamburger menu)
    $(document).on('click', '.menu-toggle', function(e) {
        e.preventDefault();

        // Close profile dropdown if open
        closeProfileDropdown();

        $('.menuTopBox').toggleClass('active');

        // Add overlay for menu
        if ($('.menuTopBox').hasClass('active')) {
            if ($('.menu-overlay').length === 0) {
                $('body').append('<div class="menu-overlay"></div>');
            }
            $('.menu-overlay').addClass('active');
            $('body').addClass('menu-open');
        } else {
            $('.menu-overlay').removeClass('active');
            $('body').removeClass('menu-open');
            setTimeout(() => {
                $('.menu-overlay').remove();
            }, 300);
        }
    });

    // Close menu when clicking back button
    $(document).on('click', '#backmenu', function(e) {
        e.preventDefault();
        $('.menuTopBox').removeClass('active');
        $('.menu-overlay').removeClass('active');
        $('body').removeClass('menu-open');
        setTimeout(() => {
            $('.menu-overlay').remove();
        }, 300);
    });

    // Close menu when clicking overlay
    $(document).on('click', '.menu-overlay', function(e) {
        $('.menuTopBox').removeClass('active');
        $('.menu-overlay').removeClass('active');
        $('body').removeClass('menu-open');
        setTimeout(() => {
            $('.menu-overlay').remove();
        }, 300);
    });

    // Add smooth scroll to top functionality
    $(document).on('click', '.scroll-to-top', function(e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 500);
    });
    
});
