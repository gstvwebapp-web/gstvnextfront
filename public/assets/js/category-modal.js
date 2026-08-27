/**
 * Category Selection Modal Functionality
 */

$(document).ready(function() {
    

    // Function to fetch user's selected categories
    function fetchUserSelectedCategories(userId) {
        return new Promise((resolve, reject) => {
    
            // Prepare FormData for the API call
            let formData = new FormData();
            formData.append('user_id', userId);

            $.ajax({
                url: 'https://www.gstv.in/backend2/api/v13/mobile/categorysettingweb',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GSTV-NextJS-App/1.0'
                },
                success: function(response) {
                    // Return the category array from response
                    resolve(response.category || []);
                },
                error: function(xhr, status, error) {
                    resolve([]); // Return empty array on error
                }
            });
        });
    }

    // Function to load categories using the correct API
    async function loadCategories() {
        // Get user ID first
        let userId = null;
        try {
            const userSession = localStorage.getItem('userSession');
            if (userSession) {
                const sessionData = JSON.parse(userSession);
                userId = sessionData.userData?.user_id || sessionData.userData?.id || sessionData.user_id || sessionData.id;
            }
        } catch (e) {
            console.error('Error parsing user session:', e);
        }

        // Use the correct API endpoint for category settings
        let url = 'https://www.gstv.in/backend2/api/v13/mobile/categorysettingweb';//getApiEndpoint('CATEGORY_SETTING');

        // Show loading state
        $('.categorydataList').html('');
        $('.no-resultscat').hide();
        $('.loading-categories').show();

        // Fetch user's selected categories if user is logged in
        let userSelectedCategories = [];
        if (userId) {
            userSelectedCategories = await fetchUserSelectedCategories(userId);

        }

        $.ajax({
            url: url,
            type: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            success: function(response) {

                $('.loading-categories').hide();

                let categoryHTML = '';

                // Filter categories with parentID: 0 and status: "Active"
                if (response.category && response.category.length > 0) {
                    const activeParentCategories = response.category.filter(function(category) {
                        return category.parentID === 0 && category.status === 'Active';
                    });



                    if (activeParentCategories.length > 0) {
                        activeParentCategories.forEach(function(category) {
                            // Check if this category is in user's selected categories
                            const isSelected = userSelectedCategories.includes(category.id);
                            const checkedAttr = isSelected ? 'checked' : '';

                            // Set background and text color based on selection
                            const backgroundColor = isSelected ? '#8B0000' : '#fff';
                            const textColor = isSelected ? 'white' : '#333';
                            const borderColor = isSelected ? '#8B0000' : '#d4a574';



                            // Use the title field from the API response with improved styling
                            categoryHTML += `<div class="categoryBtn">
                                    <label style="margin: 0; cursor: pointer; display: block;">
                                        <input type="checkbox" name="category[]" value="${category.id}" ${checkedAttr} style="display: none;">
                                        <span style="
                                            display: block;
                                            padding: 12px 20px;
                                            border: 2px solid ${borderColor};
                                            border-radius: 25px;
                                            text-align: center;
                                            font-weight: 600;
                                            font-size: 14px;
                                            color: ${textColor};
                                            transition: all 0.3s ease;
                                            font-family: 'Hind Vadodara', sans-serif;
                                        ">${category.category_name_guj}</span>
                                    </label>
                                </div>`;
                        });
                    } else {
                        categoryHTML = '<div class="no-categories" style="text-align: center; padding: 40px; color: #666; font-size: 16px;">કોઈ કેટેગરી મળી નથી</div>';
                    }
                } else {
                    categoryHTML = '<div class="no-categories" style="text-align: center; padding: 40px; color: #666; font-size: 16px;">કોઈ કેટેગરી મળી નથી</div>';
                }

                $('.categorydataList').html(categoryHTML);

                // Add hover effects
                $('.categoryBtn label span').hover(
                    function() {
                        $(this).css({
                            'background-color': '#8B0000',
                            'color': 'white'
                        });
                    },
                    function() {
                        if (!$(this).prev('input').is(':checked')) {
                            $(this).css({
                                'background-color': '#fff',
                                'color': '#333'
                            });
                        }
                    }
                );

                // Handle checkbox changes
                $('.categoryBtn input[type="checkbox"]').change(function() {
                    const span = $(this).next('span');
                    if ($(this).is(':checked')) {
                        span.css({
                            'background-color': '#8B0000',
                            'color': 'white',
                            'border-color': '#8B0000'
                        });
                    } else {
                        span.css({
                            'background-color': '#fff',
                            'color': '#333',
                            'border-color': '#d4a574'
                        });
                    }
                });
            },
            error: function(xhr, status, error) {
               
                $('.loading-categories').hide();
                $('.categorydataList').html('<div class="error-message" style="text-align: center; padding: 40px; color: #dc3545; font-size: 16px;">કેટેગરી લોડ કરવામાં ભૂલ થઈ</div>');
            }
        });
    }

    // Handle modal show event (this will work when modal is opened from React)
    $('#myCategoryModal').on('show.bs.modal', function() {
       
        loadCategories();
    });

    // Also handle direct click (backup method)
    $(document).on('click', '#myCategory', function(e) {
       
        e.preventDefault();

        // Try multiple methods to open the modal
        if (typeof window !== 'undefined') {
            // Method 1: Bootstrap 5 Modal
            if (window.bootstrap && window.bootstrap.Modal) {
                const modal = document.getElementById('myCategoryModal');
                if (modal) {
                    const bootstrapModal = new window.bootstrap.Modal(modal);
                    bootstrapModal.show();
       
                }
            }
            // Method 2: jQuery Modal
            else if (window.$) {
                $("#myCategoryModal").modal('show');
       
            }
            // Method 3: Direct style manipulation
            else {
                const modal = document.getElementById('myCategoryModal');
                if (modal) {
                    modal.style.display = 'block';
                    modal.classList.add('show');
                    document.body.classList.add('modal-open');
       
                }
            }
        }

        // Load categories after a short delay
        setTimeout(loadCategories, 100);
    });

    // Add city search functionality
    $("#categorySearch").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        let hasVisibleCity = false;
        
        $(".categoryBtn").filter(function() {
            let isVisible = $(this).text().toLowerCase().indexOf(value) > -1;
            $(this).toggle(isVisible);
            if (isVisible) hasVisibleCity = true;
        });
        
        if (hasVisibleCity) {
            $(".no-resultscat").hide();
        } else {
            $(".no-resultscat").show();
        }
    });

    // Handle form submission when "આગળ વધો" is clicked
    $("#btnSubmitCategory").on("click", function() {
       
        
        // Get selected categories
        let selectedCategories = [];
        $('input[name="category[]"]:checked').each(function() {
            selectedCategories.push(parseInt($(this).val()));
        });

       

        if (selectedCategories.length === 0) {
            alert('કૃપા કરીને ઓછામાં ઓછી એક કેટેગરી પસંદ કરો');
            return;
        }

        // Get user ID from session/localStorage
        let userId = null;
        
        // Try to get user ID from localStorage
        try {
            const userSession = localStorage.getItem('userSession');
            if (userSession) {
                const sessionData = JSON.parse(userSession);
                userId = sessionData.userData?.user_id || sessionData.userData?.id || sessionData.user_id || sessionData.id;
            }
        } catch (e) {
            console.error('Error parsing user session:', e);
        }

        if (!userId) {
            alert('કૃપા કરીને પહેલા લોગિન કરો');
            return;
        }

       

        // Submit directly to staging API
        let url = 'https://www.gstv.in/backend2/api/v13/mobile/usercategory';//getApiEndpoint('USER_CATEGORY');

        // Prepare FormData for staging API
        let formData = new FormData();
        formData.append('user_id', userId);
        formData.append('category_id', JSON.stringify(selectedCategories));

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'GSTV-NextJS-App/1.0'
            },
            success: function(response) {
         
                // Close modal
                $('#myCategoryModal').modal('hide');
                
                // Show success message
                // alert('કેટેગરી સફળતાપૂર્વક અપડેટ થઈ ગઈ!');
            },
            error: function(xhr, status, error) {
       
                let errorMessage = 'કેટેગરી અપડેટ કરવામાં ભૂલ થઈ';
                
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.error) {
                        errorMessage = response.error;
                    }
                } catch (e) {
                    // Use default error message
                }
                
                alert(errorMessage);
            }
        });
    });
});
